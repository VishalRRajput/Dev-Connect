const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to protect routes
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// @route   POST api/projects
// @desc    Create a project
router.post('/', auth, async (req, res) => {
  const { title, description, skillsNeeded, teamSize } = req.body;

  try {
    const newProject = new Project({
      title,
      description,
      skillsNeeded,
      teamSize,
      owner: req.user.id,
      members: [req.user.id] // Owner is automatically a member
    });

    const project = await newProject.save();

    // Add project to user's joinedProjects
    const user = await User.findById(req.user.id);
    user.joinedProjects.push(project.id);
    await user.save();

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/projects
// @desc    Get all active projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ status: { $ne: 'Completed' } }).populate('owner', 'name').sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/projects/recommended
// @desc    Get recommended projects for logged in user based on skills
router.get('/recommended', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.skills.length === 0) {
      return res.json([]); // No skills to match against
    }

    // Find active projects where at least one required skill is in the user's skill list
    // (Ensure case-insensitive matching if possible, but basic $in works for exact string matching)
    const projects = await Project.find({
       status: 'Open',
       skillsNeeded: { $in: user.skills },
       members: { $ne: user._id } // Not already a member
    }).populate('owner', 'name').limit(10);
    
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/projects/:id
// @desc    Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name skills reputationScore')
      .populate('applicants', 'name skills reputationScore');

    if (!project) return res.status(404).json({ msg: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/projects/:id/matches
// @desc    Get suggested users for a project based on required skills
router.get('/:id/matches', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    
    // Convert required skills to lowercase for case-insensitive matching
    const requiredSkills = project.skillsNeeded.map(s => s.toLowerCase());
    
    if (requiredSkills.length === 0) return res.json([]);

    // Find all users who are NOT already members
    const potentialUsers = await User.find({ _id: { $nin: project.members } });

    // Calculate match score
    const matches = potentialUsers.map(u => {
      let matchCount = 0;
      const userSkills = u.skills.map(s => s.toLowerCase());
      
      requiredSkills.forEach(reqSkill => {
        if (userSkills.includes(reqSkill)) {
          matchCount++;
        }
      });
      
      const score = (matchCount / requiredSkills.length) * 100;
      return {
        user: { _id: u._id, name: u.name, skills: u.skills, reputationScore: u.reputationScore },
        matchScore: Math.round(score)
      };
    }).filter(m => m.matchScore > 0) // only return users with at least some match
      .sort((a, b) => b.matchScore - a.matchScore) // Highest match first
      .limit(10);

    res.json(matches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/projects/:id/apply
// @desc    Apply to join a project
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Check if user is already a member
    if (project.members.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already a member' });
    }

    // Check if user already applied
    if (project.applicants.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already applied' });
    }

    project.applicants.push(req.user.id);
    await project.save();

    res.json({ msg: 'Application successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/projects/:id/approve/:userId
// @desc    Approve an applicant
router.post('/:id/approve/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Check if req.user is the owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Check if room available
    if (project.members.length >= project.teamSize) {
      return res.status(400).json({ msg: 'Team is full' });
    }

    // Add to members & remove from applicants
    if (!project.applicants.includes(req.params.userId)) {
      return res.status(400).json({ msg: 'User did not apply' });
    }

    project.members.push(req.params.userId);
    project.applicants = project.applicants.filter(app => app.toString() !== req.params.userId);

    await project.save();

    // Add project to user's joinedProjects and grant +10 reputation for joining
    const user = await User.findById(req.params.userId);
    user.joinedProjects.push(project.id);
    user.reputationScore = (user.reputationScore || 0) + 10;
    await user.save();

    res.json({ msg: 'User approved', members: project.members });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/projects/:id/complete
// @desc    Mark project as completed and assign reputation
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Check if req.user is the owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    if (project.status === 'Completed') {
      return res.status(400).json({ msg: 'Project is already completed' });
    }

    project.status = 'Completed';
    await project.save();

    // Reward all members with +30 reputation & +1 project completed
    await User.updateMany(
      { _id: { $in: project.members } },
      { 
        $inc: { reputationScore: 30, projectsCompleted: 1 }
      }
    );

    res.json({ msg: 'Project completed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
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

// @route   GET api/tasks/project/:projectId
// @desc    Get all tasks for a specific project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    
    // Check if user is member or owner
    if (!project.members.includes(req.user.id) && project.owner.toString() !== req.user.id) {
       return res.status(401).json({ msg: 'Not authorized to view tasks' });
    }

    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedTo', 'name');
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/tasks/project/:projectId
// @desc    Create a new task
router.post('/project/:projectId', auth, async (req, res) => {
  const { title, description } = req.body;
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    
    // Must be member to create tasks
    if (!project.members.includes(req.user.id)) {
       return res.status(401).json({ msg: 'Not authorized to create tasks' });
    }

    const newTask = new Task({
      title,
      description,
      project: project._id,
      status: 'To Do' // default
    });

    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tasks/:id/status
// @desc    Update task status
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    if (status === 'Verified') {
      return res.status(400).json({ msg: 'Cannot set status directly to Verified. Use the verify endpoint.' });
    }

    task.status = status;
    await task.save();

    // Populate assignedTo so frontend updates gracefully
    task = await Task.findById(req.params.id).populate('assignedTo', 'name');
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tasks/:id/assign
// @desc    Assign user to task
router.put('/:id/assign', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Assigning self or unassigning
    task.assignedTo = req.body.userId || req.user.id;
    await task.save();

    task = await Task.findById(req.params.id).populate('assignedTo', 'name');
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tasks/:id/verify
// @desc    Verify task status and grant reputation. Auto-completes project if all tasks verified.
router.put('/:id/verify', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Only owner can verify tasks
    if (project.owner.toString() !== req.user.id) {
       return res.status(401).json({ msg: 'Only the project owner can verify tasks' });
    }

    if (task.status === 'Verified') {
       return res.status(400).json({ msg: 'Task is already verified' });
    }

    // Set task to Verified
    task.status = 'Verified';
    await task.save();

    // Award +10 reputation to the assigned user
    if (task.assignedTo) {
       const user = await User.findById(task.assignedTo);
       if (user) {
         user.reputationScore = (user.reputationScore || 0) + 10;
         await user.save();
       }
    }

    // Check Auto-Completion Logic: Are all tasks for this project Verified?
    const allTasks = await Task.find({ project: project._id });
    const allVerified = allTasks.length > 0 && allTasks.every(t => t.status === 'Verified');

    if (allVerified && project.status !== 'Completed') {
      project.status = 'Completed';
      await project.save();

      // Grant completion bonus to all members
      for (let memberId of project.members) {
        const memberUser = await User.findById(memberId);
        if (memberUser) {
          memberUser.reputationScore = (memberUser.reputationScore || 0) + 20;
          memberUser.projectsCompleted = (memberUser.projectsCompleted || 0) + 1;
          await memberUser.save();
        }
      }
    }

    task = await Task.findById(req.params.id).populate('assignedTo', 'name');
    res.json({ task, projectCompleted: allVerified && project.status === 'Completed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

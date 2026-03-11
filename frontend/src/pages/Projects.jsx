import React, { useState, useEffect } from 'react';
import api from '../api';
import ProjectCard from '../components/ProjectCard';
import { Plus, Search, X } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [manageProject, setManageProject] = useState(null); // the project being viewed by its owner
  const [matches, setMatches] = useState([]); // AI matched recommended teammates
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'recommended'
  const [newProject, setNewProject] = useState({ title: '', description: '', skillsNeeded: '', teamSize: 2 });
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (viewMode === 'all') {
      fetchProjects();
    } else {
      fetchRecommendedProjects();
    }
  }, [viewMode]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedProjects = async () => {
    if (!token) return alert('Please login to see recommendations');
    setLoading(true);
    try {
      const res = await api.get('/projects/recommended', {
        headers: { 'x-auth-token': token }
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (id) => {
    if (!token) return alert('Please login to apply');
    try {
      await api.post(`/projects/${id}/apply`, {}, {
        headers: { 'x-auth-token': token }
      });
      alert('Application sent successfully!');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error applying to project');
    }
  };

  const handleManage = async (id) => {
    try {
      const res = await api.get(`/projects/${id}`);
      setManageProject(res.data);

      // fetch AI matched applicants
      const matchesRes = await api.get(`/projects/${id}/matches`, {
        headers: { 'x-auth-token': token }
      });
      setMatches(matchesRes.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching project details');
    }
  };

  const handleApprove = async (projectId, userId) => {
    try {
      await api.post(`/projects/${projectId}/approve/${userId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      alert('User approved!');
      
      // refresh manage data
      handleManage(projectId);
      // refresh global projects list
      fetchProjects(); 
    } catch (err) {
      alert(err.response?.data?.msg || 'Error approving applicant');
    }
  };

  const handleCompleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to mark this project as completed? This will grant reputation to all members.')) return;
    try {
      await api.post(`/projects/${projectId}/complete`, {}, {
        headers: { 'x-auth-token': token }
      });
      alert('Project marked as completed!');
      setManageProject(null);
      if (viewMode === 'all') fetchProjects();
      else fetchRecommendedProjects();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error completing project');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProject,
        skillsNeeded: newProject.skillsNeeded.split(',').map(s => s.trim())
      };
      const res = await api.post('/projects', payload, {
        headers: { 'x-auth-token': token }
      });
      setProjects([res.data, ...projects]);
      setShowModal(false);
      setNewProject({ title: '', description: '', skillsNeeded: '', teamSize: 2 });
    } catch (err) {
      alert(err.response?.data?.msg || 'Error creating project');
    }
  };

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Explore Projects</h1>
          <p className="text-gray-400 text-lg mb-4">Find your next side project and team</p>
          
          {token && (
            <div className="flex bg-gray-800/50 p-1 rounded-xl w-fit border border-gray-700">
              <button 
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                All Projects
              </button>
              <button 
                onClick={() => setViewMode('recommended')}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'recommended' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                <span>Recommended</span>
                <span className="flex h-2 w-2 relative ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </button>
            </div>
          )}
        </div>
        
        {token && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
          >
            <Plus size={20} /> Post a Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading projects...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
             <div key={project._id} className="relative group">
                <ProjectCard project={project} onApply={handleApply} />
                {user.id === (project.owner?._id || project.owner) && (
                  <button 
                    onClick={() => handleManage(project._id)}
                    className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-xs px-3 py-1 rounded-full border border-gray-600 transition"
                  >
                    Manage
                  </button>
                )}
             </div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">
              No projects found. Be the first to post one!
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-2xl md:p-8 p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Post a New Project</h2>
            
            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Project Title</label>
                <input required type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="E.g. AI Resume Analyzer" />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea required rows={4} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Describe the goal and features..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Skills Needed (comma separated)</label>
                  <input required type="text" value={newProject.skillsNeeded} onChange={e => setNewProject({...newProject, skillsNeeded: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="React, Node.js, AI" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Team Size</label>
                  <input required type="number" min="1" max="10" value={newProject.teamSize} onChange={e => setNewProject({...newProject, teamSize: parseInt(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition">Cancel</button>
                <button type="submit" className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition shadow-lg shadow-blue-500/20 font-medium">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Manage Project Modal */}
      {manageProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-5xl rounded-3xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setManageProject(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition">
              <X size={24} />
            </button>
            <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-6 pr-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{manageProject.title}</h2>
                <p className="text-gray-400">Manage your project members and applicants.</p>
              </div>
              {manageProject.status !== 'Completed' && (
                <button 
                  onClick={() => handleCompleteProject(manageProject._id)}
                  className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap"
                >
                  Mark as Completed
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Members List */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Current Team ({manageProject.members.length}/{manageProject.teamSize})</h3>
                {manageProject.members.length === 0 ? (
                   <p className="text-gray-500 text-sm">No members yet.</p>
                ) : (
                   <div className="space-y-3">
                     {manageProject.members.map(member => (
                       <div key={member._id} className="bg-gray-800/50 p-3 rounded-xl border border-gray-700 flex justify-between items-center">
                          <div>
                            <span className="text-white font-medium">{member.name}</span>
                            <div className="text-xs text-blue-400 mt-1">{member.skills?.join(', ')}</div>
                          </div>
                       </div>
                     ))}
                   </div>
                )}
              </div>

              {/* Applicants List */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Applicants ({manageProject.applicants.length})</h3>
                {manageProject.applicants.length === 0 ? (
                   <p className="text-gray-500 text-sm">No new applications.</p>
                ) : (
                   <div className="space-y-3">
                     {manageProject.applicants.map(app => (
                       <div key={app._id} className="bg-gray-800/80 p-4 rounded-xl border border-gray-700">
                          <div className="mb-3">
                            <span className="text-white font-medium block">{app.name}</span>
                            <span className="text-xs text-emerald-400 block mt-1">{app.reputationScore || 0} Rep score</span>
                            <span className="text-xs text-blue-400 block mt-1">{app.skills?.join(', ')}</span>
                          </div>
                          <button 
                            onClick={() => handleApprove(manageProject._id, app._id)}
                            disabled={manageProject.members.length >= manageProject.teamSize}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Approve & Add to Team
                          </button>
                       </div>
                     ))}
                   </div>
                )}
              </div>

              {/* AI Suggested Teammates */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span>Suggested Matches</span>
                  <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full text-white">AI</span>
                </h3>
                {matches.length === 0 ? (
                   <p className="text-gray-500 text-sm">No matching users found.</p>
                ) : (
                   <div className="space-y-3">
                     {matches.map(({ user, matchScore }) => (
                       <div key={user._id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 opacity-80 hover:opacity-100 transition">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-white font-medium block">{user.name}</span>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">{matchScore}% Match</span>
                          </div>
                          <span className="text-xs text-yellow-500 block mb-1">{user.reputationScore} Rep</span>
                          <span className="text-xs text-gray-400 block break-all">{user.skills?.join(', ')}</span>
                       </div>
                     ))}
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;

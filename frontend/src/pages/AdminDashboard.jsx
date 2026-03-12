import React, { useState, useEffect } from 'react';
import api from '../api';
import { Shield, Layout, Users, ExternalLink, Search, Filter } from 'lucide-react';

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await api.get('/projects/admin/all', {
        headers: { 'x-auth-token': token }
      });
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.owner?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Shield size={20} />
            <span className="text-sm font-bold tracking-wider uppercase">Admin Control Panel</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">System Oversight</h1>
        </div>

        <div className="flex bg-gray-800/50 p-3 rounded-2xl border border-gray-700 w-full md:w-auto">
          <div className="flex items-center gap-4 px-4 border-r border-gray-700">
             <Layout className="text-gray-400" size={20} />
             <div>
               <div className="text-xs text-gray-500 font-medium">Total Projects</div>
               <div className="text-xl font-bold text-white">{projects.length}</div>
             </div>
          </div>
          <div className="flex items-center gap-4 px-4">
             <Users className="text-gray-400" size={20} />
             <div>
               <div className="text-xs text-gray-500 font-medium">Platform Health</div>
               <div className="text-xl font-bold text-emerald-400">Stable</div>
             </div>
          </div>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Search projects or owners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none transition"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredProjects.map(project => (
            <div key={project._id} className="glass-panel rounded-2xl p-6 border border-gray-800 hover:border-purple-500/30 transition-all group">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition mb-1">{project.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Created by:</span>
                        <span className="text-blue-400 font-medium">{project.owner?.name || 'Unknown'}</span>
                        <span className="text-gray-600">({project.owner?.email})</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      project.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      project.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                      'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.skillsNeeded?.map(skill => (
                      <span key={skill} className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded border border-gray-700 uppercase font-mono tracking-tighter">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:w-72 bg-black/20 rounded-xl p-4 border border-gray-800/50">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                    Team Members
                    <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-[10px]">
                      {project.members?.length || 0} / {project.teamSize}
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {project.members?.map(member => (
                      <div key={member._id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-[10px] font-bold">
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-xs font-medium text-white truncate">{member.name}</div>
                          <div className="text-[10px] text-gray-500 truncate">{member.email}</div>
                        </div>
                      </div>
                    ))}
                    {project.members?.length === 0 && (
                      <div className="text-center py-4 text-gray-600 text-xs italic">No members yet</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredProjects.length === 0 && (
             <div className="text-center py-20 text-gray-500 italic">No projects matched your search criteria.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

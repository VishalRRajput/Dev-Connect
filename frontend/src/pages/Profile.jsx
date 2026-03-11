import React, { useState, useEffect } from 'react';
import api from '../api';
import { User as UserIcon, Settings, Github, Globe, Edit3, Loader2, Code2, Star, Award } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ skills: '', experienceLevel: '', githubLink: '', portfolio: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me', {
        headers: { 'x-auth-token': token }
      });
      setProfile(res.data);
      setEditForm({
        skills: res.data.skills?.join(', ') || '',
        experienceLevel: res.data.experienceLevel || 'Beginner',
        githubLink: res.data.githubLink || '',
        portfolio: res.data.portfolio || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editForm,
        skills: editForm.skills.split(',').map(s => s.trim())
      };
      const res = await api.put('/auth/profile', payload, {
        headers: { 'x-auth-token': token }
      });
      setProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.msg || 'Update failed');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;
  if (!profile) return <div className="text-center py-20 text-gray-400 text-xl font-semibold">Please log in to view profile.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="glass-panel rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-600 flex items-center justify-center border-4 border-gray-800 shadow-xl">
            <span className="text-5xl font-bold text-white">{profile.name.charAt(0).toUpperCase()}</span>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{profile.name}</h1>
                <p className="text-gray-400 text-lg mb-4">{profile.email}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                    {profile.experienceLevel} Developer
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-medium border border-yellow-500/30">
                    <Star size={14} fill="currentColor" /> {profile.reputationScore || 0} Rep
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30">
                    <Award size={14} /> {profile.projectsCompleted || 0} Completed
                  </span>
                </div>
              </div>
              <button onClick={() => setIsEditing(!isEditing)} className="text-gray-400 hover:text-white transition p-2 bg-gray-800 rounded-lg">
                <Edit3 size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
              {profile.githubLink && (
                <a href={profile.githubLink} target="_blank" rel="noreferrer" className="flex items-center text-gray-300 hover:text-white transition bg-gray-800 px-4 py-2 rounded-lg gap-2">
                  <Github size={18} /> GitHub
                </a>
              )}
              {profile.portfolio && (
                <a href={profile.portfolio} target="_blank" rel="noreferrer" className="flex items-center text-gray-300 hover:text-white transition bg-gray-800 px-4 py-2 rounded-lg gap-2">
                  <Globe size={18} /> Portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <form onSubmit={handleUpdate} className="glass-panel p-8 rounded-3xl mb-8 space-y-6">
          <h3 className="text-xl font-bold text-white mb-4">Edit Profile</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Skills (comma separated)</label>
              <input type="text" value={editForm.skills} onChange={e => setEditForm({...editForm, skills: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="React, Python, AWS" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Experience Level</label>
              <select value={editForm.experienceLevel} onChange={e => setEditForm({...editForm, experienceLevel: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">GitHub URL</label>
              <input type="url" value={editForm.githubLink} onChange={e => setEditForm({...editForm, githubLink: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://github.com/..." />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Portfolio URL</label>
              <input type="url" value={editForm.portfolio} onChange={e => setEditForm({...editForm, portfolio: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition border border-gray-700">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition shadow-lg shadow-blue-500/20">Save Changes</button>
          </div>
        </form>
      )}

      <div className="glass-panel p-8 rounded-3xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Code2 className="text-blue-400" /> My Skills</h3>
        {profile.skills?.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {profile.skills.map(skill => (
              <span key={skill} className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-blue-300 shadow-sm shadow-blue-500/5">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No skills added yet. Edit your profile to add some!</p>
        )}
      </div>
    </div>
  );
};

export default Profile;

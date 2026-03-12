import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Terminal, LogOut, User, MessageSquare, Briefcase, Trophy, Shield } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 hover:opacity-80 transition">
          <Terminal className="text-blue-400" />
          <span>DevConnect</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/projects" className={`flex items-center space-x-1 transition ${isActive('/projects') ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
            <Briefcase size={18} />
            <span>Projects</span>
          </Link>

          <Link to="/leaderboard" className={`flex items-center space-x-1 transition ${isActive('/leaderboard') ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
            <Trophy size={18} />
            <span>Top Devs</span>
          </Link>

          {token ? (
            <>
              <Link to="/workspace" className={`flex items-center space-x-1 transition ${isActive('/workspace') ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                <MessageSquare size={18} />
                <span className="hidden sm:inline">Workspace</span>
              </Link>
              <Link to="/profile" className={`flex items-center space-x-1 transition ${isActive('/profile') ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                <User size={18} />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              {JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' && (
                <Link to="/admin" className={`flex items-center space-x-1 transition ${isActive('/admin') ? 'text-purple-400' : 'text-gray-300 hover:text-white'}`}>
                  <Shield size={18} />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition">
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition shadow-lg shadow-blue-500/30">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

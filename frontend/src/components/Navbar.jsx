import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Terminal, LogOut, User, MessageSquare, Briefcase, Trophy, Shield, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 hover:opacity-80 transition">
            <Terminal className="text-blue-400" />
            <span>DevConnect</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
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
                  <span>Workspace</span>
                </Link>
                <Link to="/profile" className={`flex items-center space-x-1 transition ${isActive('/profile') ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                {JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' && (
                  <Link to="/admin" className={`flex items-center space-x-1 transition ${isActive('/admin') ? 'text-purple-400' : 'text-gray-300 hover:text-white'}`}>
                    <Shield size={18} />
                    <span>Admin</span>
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition shadow-lg shadow-blue-500/30">
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <div className="w-6 h-6 flex flex-col justify-around">
                  <span className="w-full h-0.5 bg-current"></span>
                  <span className="w-full h-0.5 bg-current"></span>
                  <span className="w-full h-0.5 bg-current"></span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-800 space-y-2 animate-in slide-in-from-top duration-300">
            <Link 
              to="/projects" 
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition ${isActive('/projects') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              <Briefcase size={22} />
              <span className="text-lg font-medium">Projects</span>
            </Link>
            <Link 
              to="/leaderboard" 
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition ${isActive('/leaderboard') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              <Trophy size={22} />
              <span className="text-lg font-medium">Top Devs</span>
            </Link>
            
            {token ? (
              <>
                <Link 
                  to="/workspace" 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition ${isActive('/workspace') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <MessageSquare size={22} />
                  <span className="text-lg font-medium">Workspace</span>
                </Link>
                <Link 
                  to="/profile" 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition ${isActive('/profile') ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <User size={22} />
                  <span className="text-lg font-medium">Profile</span>
                </Link>
                {JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition ${isActive('/admin') ? 'bg-purple-600/10 text-purple-400' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    <Shield size={22} />
                    <span className="text-lg font-medium">Admin Panel</span>
                  </Link>
                )}
                <div className="pt-2 border-t border-gray-800/50">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition"
                  >
                    <LogOut size={22} />
                    <span className="text-lg font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4">
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

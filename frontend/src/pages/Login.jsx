import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Terminal, Loader2, ShieldCheck, User as UserIcon } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { name, email, password } = formData;
    if (!isLogin && !name) return 'Full Name is required';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';

    if (!isLogin) {
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
      if (!passwordRegex.test(password)) {
        return 'Password must be at least 8 characters long, include a number and a special character';
      }
    } else if (!password) {
      return 'Password is required';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    const path = isLogin ? '/auth/login' : '/auth/register';

    try {
      const res = await api.post(path, formData);

      // Verify role if trying to access via Admin mode
      if (isAdminMode && res.data.user.role !== 'admin') {
        setError('Invalid credentials for Admin access');
        return; // Don't save tokens or navigate
      }

      // Verify role if trying to access via User mode (optional, but good practice)
      if (!isAdminMode && res.data.user.role === 'admin') {
        setError('Please use the Admin tab to log in');
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/projects');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="glass-panel w-full max-w-md p-6 md:p-8 rounded-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4 shadow-lg shadow-blue-500/30">
              {isAdminMode ? <ShieldCheck className="text-white" size={24} /> : <Terminal className="text-white" size={24} />}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {isLogin ? (isAdminMode ? 'Admin Access' : 'Welcome Back') : 'Join DevConnect'}
            </h2>
            <p className="text-sm md:text-base text-gray-400">
              {isLogin ? 'Enter your details to access your account' : 'Start collaborating with developers worldwide'}
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setIsAdminMode(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${!isAdminMode ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <UserIcon size={16} /> User
            </button>
            <button
              onClick={() => {
                setIsAdminMode(true);
                setIsLogin(true); // Admins can only log in, not sign up
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isAdminMode ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <ShieldCheck size={16} /> Admin
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="••••••••"
              />
              {!isLogin && (
                <p className="mt-1 text-[10px] text-gray-500">
                  Min 8 chars, 1 number, 1 special character
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${isAdminMode ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'} text-white font-semibold py-3 rounded-xl transition shadow-lg flex justify-center items-center gap-2 mt-6`}
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {isLogin ? (isAdminMode ? 'Admin Login' : 'Sign In') : 'Create Account'}
            </button>
          </form>

          {!isAdminMode && (
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

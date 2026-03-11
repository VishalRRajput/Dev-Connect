import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Star, Medal, Loader2, Award } from 'lucide-react';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/auth/leaderboard');
      setLeaders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (score, index) => {
    if (index === 0) return <Trophy className="text-yellow-400" size={24} />;
    if (index === 1) return <Medal className="text-gray-300" size={24} />;
    if (index === 2) return <Medal className="text-amber-600" size={24} />;
    return <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>;
  };

  const getRankTitle = (score) => {
    if (score >= 500) return 'Master';
    if (score >= 300) return 'Advanced';
    if (score >= 100) return 'Intermediate';
    return 'Novice';
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 mb-6 shadow-lg shadow-yellow-500/30">
          <Trophy className="text-white" size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-2">DevConnect Leaderboard</h1>
        <p className="text-gray-400 text-lg">Top developers ranked by contribution and reputation.</p>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
        <div className="bg-gray-900/80 px-6 py-4 border-b border-gray-800 grid grid-cols-12 gap-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5">Developer</div>
          <div className="col-span-3 text-center">Projects</div>
          <div className="col-span-3 text-right">Reputation</div>
        </div>

        <div className="divide-y divide-gray-800/50">
          {leaders.map((user, idx) => (
            <div key={user._id} className="p-6 grid grid-cols-12 gap-4 items-center hover:bg-gray-800/30 transition group">
              <div className="col-span-1 flex justify-center">
                {getRankBadge(user.reputationScore, idx)}
              </div>
              
              <div className="col-span-5">
                <div className="font-bold text-lg text-white group-hover:text-blue-400 transition">{user.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {getRankTitle(user.reputationScore)}
                  </span>
                  <span className="text-xs text-gray-500 truncate max-w-[150px]">{user.skills?.join(', ')}</span>
                </div>
              </div>
              
              <div className="col-span-3 flex justify-center items-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-200">{user.projectsCompleted}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Completed</div>
                </div>
              </div>
              
              <div className="col-span-3 flex justify-end items-center">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-500/20 px-4 py-2 rounded-xl">
                  <Star className="text-blue-400" size={16} fill="currentColor" />
                  <span className="text-xl font-bold tracking-tight text-white">{user.reputationScore}</span>
                </div>
              </div>
            </div>
          ))}
          {leaders.length === 0 && (
            <div className="text-center py-10 text-gray-500">No developers ranked yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

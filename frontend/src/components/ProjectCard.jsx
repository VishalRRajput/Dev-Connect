import React from 'react';
import { Users, Code2, ArrowRight } from 'lucide-react';

const ProjectCard = ({ project, onApply }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full hover:border-blue-500/50 transition duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">{project.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          project.status === 'Open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
          'bg-gray-700/50 text-gray-300 border border-gray-600'
        }`}>
          {project.status}
        </span>
      </div>
      
      <p className="text-gray-400 text-sm mb-6 flex-grow line-clamp-3">
        {project.description}
      </p>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {project.skillsNeeded?.map(skill => (
            <span key={skill} className="bg-gray-800 border border-gray-700 px-2 py-1 rounded text-xs text-blue-300">
              {skill}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center text-gray-400 text-sm">
            <Users size={16} className="mr-1" />
            <span>{project.members?.length || 1} / {project.teamSize}</span>
          </div>
          
          <button 
            onClick={() => onApply(project._id)}
            disabled={project.status !== 'Open'}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Now <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

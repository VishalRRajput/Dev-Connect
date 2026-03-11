import React from 'react';

import { Link } from 'react-router-dom';
import { Users, Code, Zap, ArrowRight } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="glass-panel p-6 rounded-2xl hover:-translate-y-2 transition duration-300">
        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
            <Icon className="text-blue-400" size={24} />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
);

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto pt-20 pb-16">
                <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300  font-medium mb-8 animate-pulse text-xs">
                    🚀 The Ultimate Developer Collaboration Platform
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                    Build Together, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                        Ship Faster.
                    </span>
                </h1>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Find the perfect teammates for your next side project. Connect, collaborate, and bring your ideas to life with developers worldwide.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <Link to="/projects" className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition shadow-xl shadow-blue-500/20 flex items-center gap-2 group">
                        Browse Projects
                        <ArrowRight className="group-hover:translate-x-1 transition" size={20} />
                    </Link>
                    <Link to="/login" className="px-8 py-4 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg transition border border-gray-700">
                        Join Now
                    </Link>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-16 w-full max-w-5xl">
                <FeatureCard
                    icon={Users}
                    title="Find Teammates"
                    desc="Search for developers based on skills, experience level, and interests to assemble your dream team."
                />
                <FeatureCard
                    icon={Code}
                    title="Post Projects"
                    desc="Have a great idea? Post it here and let interested developers apply to build it with you."
                />
                <FeatureCard
                    icon={Zap}
                    title="Real-time Collaboration"
                    desc="Chat with your team in real-time, share resources, and coordinate your next building session."
                />
            </div>
        </div>
    );
};

export default Home;

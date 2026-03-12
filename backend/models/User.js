const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skills: [{ type: String }],
  experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  githubLink: { type: String },
  portfolio: { type: String },
  joinedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  reputationScore: { type: Number, default: 0 },
  projectsCompleted: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

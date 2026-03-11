const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development
    methods: ['GET', 'POST']
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join_project', (data) => {
    socket.join(data.projectId);
    console.log(`User ${socket.id} joined project room: ${data.projectId}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.projectId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

// Routes will be imported here
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/project');
const taskRoutes = require('./routes/task');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://vishalrajput2522_db_user:QrzevfoV8z1h0NzA@cluster0.z1d6woa.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log('MongoDB connection error:', err));

import axios from 'axios';
import io from 'socket.io-client';

// This is the base URL for your backend. 
// When you deploy, you can change this to your Render URL.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: BASE_URL,
});

// For Socket.io
const socket = io(BASE_URL);

export { api, socket, BASE_URL };
export default api;

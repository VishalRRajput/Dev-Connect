import axios from 'axios';
import io from 'socket.io-client';

// This is the base URL for your backend. 
// When you deploy, you can change this in Vercel to your Render URL.
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Ensure the baseURL for axios always has /api, but the socket uses the root domain
const BASE_URL = BACKEND_URL.endsWith('/api') ? BACKEND_URL : `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: BASE_URL,
});

// For Socket.io - needs the root URL (without /api)
const socket = io(BACKEND_URL);

export { api, socket, BASE_URL };
export default api;

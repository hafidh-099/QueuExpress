import axios from 'axios';

// Change this to your computer's IP address
// On Mac/Linux: run 'ifconfig' or 'ip a' and Replace 192.168.1.5 with your actual IP

const API_URL = 'http://10.4.11.80:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://generativeai-pdf-chatbot.onrender.com', // Update with your actual backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;

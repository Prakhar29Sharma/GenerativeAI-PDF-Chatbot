import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://generativeai-pdf-chatbot.onrender.com',
});

export default axiosInstance;

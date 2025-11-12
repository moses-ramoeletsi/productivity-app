import axios from 'axios';

const API_URL = 'https://productivity-app-server-ashy.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
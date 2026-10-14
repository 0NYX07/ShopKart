import axios from 'axios';

const api = axios.create({
  baseURL: 'https://shopkart-backend-mu.vercel.app',
  withCredentials: true,
});

// Interceptor to uniformly capture and expose status codes
api.interceptors.response.use(
  (response) => {
    response.statusCode = response.data?.statusCode || response.status;
    return response;
  },
  (error) => {
    if (error.response) {
      error.statusCode = error.response.data?.statusCode || error.response.status;
      error.statusMessage = error.response.data?.message || error.message;
    }
    return Promise.reject(error);
  }
);

export default api;

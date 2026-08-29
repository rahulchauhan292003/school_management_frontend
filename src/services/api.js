import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const targetSchoolCode = localStorage.getItem('targetSchoolCode');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Super Admin viewing context header
  if (targetSchoolCode) {
    config.headers['X-School-Code'] = targetSchoolCode;
  }

  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => {
    // Show toast for non-GET successful actions
    if (response.data && response.data.message && response.config.method !== 'get') {
      toast.success(response.data.message);
    }
    return response.data;
  },
  (error) => {
    const errorData = error.response?.data;
    
    if (errorData) {
      // Check if backend returned structured Yup validation errors array
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorData.errors.forEach((err) => {
          const fieldPrefix = err.field ? `${err.field}: ` : '';
          toast.error(`${fieldPrefix}${err.message}`, {
            duration: 5000,
            style: {
              background: '#0f172a',
              color: '#f87171',
              border: '1px solid #991b1b',
              fontSize: '12px',
            },
          });
        });
      } else if (errorData.message) {
        toast.error(errorData.message, {
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#f87171',
            border: '1px solid #991b1b',
            fontSize: '12px',
          },
        });
      }
    } else {
      toast.error(error.message || 'An unexpected network error occurred', {
        duration: 4000,
        style: {
          background: '#0f172a',
          color: '#f87171',
          border: '1px solid #991b1b',
          fontSize: '12px',
        },
      });
    }

    const message = errorData?.message || error.message || 'An unexpected error occurred';
    const errObj = new Error(message);
    errObj.errors = errorData?.errors || [];
    return Promise.reject(errObj);
  }
);

export default api;

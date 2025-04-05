import axios from 'axios';
import { getToken, saveUser } from '../utils/jwtUtils';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API calls
export const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    if (response.data && response.data.token) {
      const userData = {
        ...response.data.user,
        token: response.data.token
      };
      
      // Save user data using our JWT utils
      saveUser(userData);
      return userData;
    }
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/users/verify-email/${token}`);
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await api.post('/users/request-password-reset', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/users/reset-password', { token, newPassword });
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

// Quiz API calls
export const uploadQuiz = async (formData) => {
  // Get the current user data with token
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    throw new Error('Authentication required');
  }

  // Create a new FormData object with the correct field name
  const serverFormData = new FormData();
  
  // Loop through the original formData entries
  for (const [key, value] of formData.entries()) {
    if (key === 'pdf') {
      // Change the field name from 'pdf' to 'pdfFile'
      serverFormData.append('pdfFile', value);
    } else {
      // Keep other fields as is
      serverFormData.append(key, value);
    }
  }
  
  const response = await api.post('/quizzes/upload', serverFormData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${user.token}`
    }
  });
  return response.data;
};

export const getUserQuizzes = async () => {
  try {
    const response = await api.get('/quizzes');
    
    // Check if we have a valid response
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    // Handle different response structures
    const quizData = response.data.data || response.data;
    
    return {
      success: true,
      data: quizData.map(quiz => ({
        ...quiz,
        createdBy: typeof quiz.createdBy === 'object' ? quiz.createdBy._id : quiz.createdBy
      }))
    };
  } catch (error) {
    console.error('Error getting user quizzes:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to load your quizzes'
    };
  }
};

export const getPublicQuizzes = async () => {
  try {
    const response = await api.get('/quizzes/public');
    
    // Check if we have a valid response
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    // Handle different response structures
    const quizData = response.data.data || response.data;
    
    return {
      success: true,
      data: quizData.map(quiz => ({
        ...quiz,
        createdBy: typeof quiz.createdBy === 'object' ? quiz.createdBy : { _id: quiz.createdBy }
      }))
    };
  } catch (error) {
    console.error('Error getting public quizzes:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to load public quizzes'
    };
  }
};
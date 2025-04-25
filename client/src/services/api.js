import axios from "axios";
import { getToken, saveUser } from "../utils/jwtUtils";

const API_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
  const response = await api.post("/users/register", userData);
  return response.data;
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials);
    if (response.data && response.data.token) {
      const userData = {
        ...response.data.user,
        token: response.data.token,
      };

      // Save user data using our JWT utils
      saveUser(userData);
      return userData;
    }
    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/users/verify-email/${token}`);
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await api.post("/users/request-password-reset", { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post("/users/reset-password", {
    token,
    newPassword,
  });
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put("/users/profile", profileData);
  return response.data;
};

// Quiz API calls
export const uploadQuiz = async (formData) => {
  // Get the current user data with token
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.token) {
    throw new Error("Authentication required");
  }

  // Create a new FormData object with the correct field name
  const serverFormData = new FormData();

  // Loop through the original formData entries
  for (const [key, value] of formData.entries()) {
    if (key === "pdf") {
      // Change the field name from 'pdf' to 'pdfFile'
      serverFormData.append("pdfFile", value);
    } else {
      // Keep other fields as is
      serverFormData.append(key, value);
    }
  }

  const response = await api.post("/quizzes/upload", serverFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${user.token}`,
    },
  });
  return response.data;
};

export const getUserQuizzes = async () => {
  try {
    const response = await api.get("/quizzes");

    // Check if we have a valid response
    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    // Handle different response structures
    const quizData = response.data.data || response.data;

    return {
      success: true,
      data: quizData.map((quiz) => ({
        ...quiz,
        createdBy:
          typeof quiz.createdBy === "object"
            ? quiz.createdBy._id
            : quiz.createdBy,
      })),
    };
  } catch (error) {
    console.error("Error getting user quizzes:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to load your quizzes",
    };
  }
};

export const getPublicQuizzes = async () => {
  try {
    const response = await api.get("/quizzes/public");

    // Check if we have a valid response
    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    // Handle different response structures
    const quizData = response.data.data || response.data;

    return {
      success: true,
      data: quizData.map((quiz) => ({
        ...quiz,
        createdBy:
          typeof quiz.createdBy === "object"
            ? quiz.createdBy
            : { _id: quiz.createdBy },
      })),
    };
  } catch (error) {
    console.error("Error getting public quizzes:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to load public quizzes",
    };
  }
};

export const getQuizById = async (quizId) => {
  const response = await api.get(`/quizzes/${quizId}`);
  return response.data;
};

export const deleteQuiz = async (quizId) => {
  const response = await api.delete(`/quizzes/${quizId}`);
  return response.data;
};

// Quiz Submission API calls
export const submitQuizSubmission = async (quizId, answers) => {
  const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
  return response.data;
};

export const getUserSubmissions = async () => {
  const response = await api.get("/submissions/user");
  return response.data;
};

export const getSubmissionById = async (submissionId) => {
  const response = await api.get(`/submissions/${submissionId}`);
  return response.data;
};

// Room API calls for multiplayer functionality
export const createRoom = async (quizId, options = {}) => {
  try {
    const response = await api.post("/rooms", { quizId, ...options });

    // Ensure we have a valid response with data
    if (!response.data || !response.data.data) {
      throw new Error("Invalid response from server");
    }

    const roomData = response.data.data;

    // Make sure we extract the room code
    return {
      success: true,
      data: {
        ...roomData,
        // Ensure code exists (it should be in roomData directly)
        code: roomData.code,
        // Make sure hostId is properly formatted if it's an object
        hostId:
          typeof roomData.hostId === "object"
            ? roomData.hostId._id
            : roomData.hostId,
        // Format any other objects that might cause rendering issues
        hostName:
          typeof roomData.hostId === "object"
            ? roomData.hostId.displayName || roomData.hostId.username
            : "Host",
      },
    };
  } catch (error) {
    console.error("Error creating room:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create room",
    };
  }
};

export const getUserRooms = async () => {
  const response = await api.get("/rooms/user");
  return response.data;
};

export const getRoomByCode = async (code) => {
  try {
    // Validate code before making the request
    if (!code || code === "undefined") {
      console.error("Invalid room code received in getRoomByCode:", code);
      return {
        success: false,
        message: "Invalid room code",
      };
    }

    console.log("Fetching room with code:", code);
    const response = await api.get(`/rooms/${code}`);

    // Check if we have a valid response
    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    // Handle different response structures
    const roomData = response.data.data || response.data;

    return {
      success: true,
      data: roomData,
    };
  } catch (error) {
    console.error(`Error getting room with code "${code}":`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Room not found",
    };
  }
};

export const joinRoom = async (code) => {
  const response = await api.post(`/rooms/${code}/join`);
  return response.data;
};

export const startRoom = async (code) => {
  try {
    const response = await api.post(`/rooms/${code}/start`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error starting room:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to start room",
    };
  }
};

export const endRoom = async (code) => {
  try {
    const response = await api.post(`/rooms/${code}/end`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error ending room:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to end room",
    };
  }
};

export const submitAnswer = async (code, questionId, answerId) => {
  try {
    const response = await api.post(`/rooms/${code}/answer`, {
      questionId,
      answerId,
    });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error submitting answer:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to submit answer",
    };
  }
};

export const getRoomParticipants = async (code) => {
  try {
    const response = await api.get(`/rooms/${code}/participants`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error getting room participants:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to load participants",
    };
  }
};

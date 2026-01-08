// Backend API Base URLs
// export const BASE_URL = 'http://localhost:5000';
export const BASE_URL = 'https://beatly-backend-bte0acbfdehqdqdj.germanywestcentral-01.azurewebsites.net';

// Specific Endpoint URLs
export const ENDPOINTS = {
  AUTH: {
    BASE: '/api/auth',
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register'
  },
  VIDEOS: {
    LIST: '/api/videos',
    UPLOAD: '/api/videos/upload',
    DETAILS: (videoId) => `/api/videos/${videoId}`,
    LIKE: (videoId) => `/api/videos/${videoId}/like`,
    DELETE: (videoId) => `/api/videos/${videoId}`,
    STATS: (videoId) => `/api/videos/${videoId}/stats`,
    ANALYTICS: '/api/videos/all-analytics'
  },
  COMMENTS: {
    ADD: '/api/comments',
    GET: (videoId) => `/api/comments/${videoId}`
  }
};


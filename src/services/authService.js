import axiosInstance from '../utils/axiosConfig';
import {ENDPOINTS} from '../utils/apiConfig';

class AuthService {
  async register(name, email, password, role = 'consumer') {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, {
        name,
        email,
        password,
        role
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async login(email, password) {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
      }

      return response.data.user;
    } catch (error) {
      throw error.response.data;
    }
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();

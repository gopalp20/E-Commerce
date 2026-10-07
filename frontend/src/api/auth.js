import api from './axios';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: ({ name, email, password, role = 'CUSTOMER' }) => {
    return api.post('/auth/register', { name, email, password }).then(async (result) => {
      if (role === 'VENDOR' && result.token) {
        localStorage.setItem('token', result.token);
        await api.post('/vendor/apply');
      }
      return result;
    });
  },
  getMe: () => api.get('/auth/me'),
};

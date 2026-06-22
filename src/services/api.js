const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 
  'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Something went wrong');
  }

  if (data.data !== undefined) {
    return data.data;
  }
  const { success, ...payload } = data;
  return payload;
};

export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
};

export const faqAPI = {
  getAll: () => apiRequest('/faqs'),

  search: (query, tag) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (tag && tag !== 'All') params.append('tag', tag);
    return apiRequest(`/faqs/search?${params.toString()}`);
  },

  getReadyForFAQ: () => apiRequest('/faqs/admin/ready-questions', {
    method: 'GET',
  }),

  convertToFAQ: (questionId) =>  apiRequest(`/faqs/convert/${questionId}`, {
    method: 'POST',
  }),
};

export const questionAPI = {
  getAll: () => apiRequest('/questions'),

  create: (data) => apiRequest('/questions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  upvote: (id) => apiRequest(`/questions/${id}/upvote`, {
    method: 'PUT',
  }),

  downvote: (id) => apiRequest(`/questions/${id}/downvote`, {
    method: 'PUT',
  }),

  getByUser: (userId) => apiRequest(`/questions/user/${userId}`),
};

export const answerAPI = {
  getByQuestion: (questionId) => apiRequest(`/answers/question/${questionId}`),

  getByUser: (userId) => apiRequest(`/answers/user/${userId}`),

  create: (questionId, data) => apiRequest(`/answers/${questionId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  upvote: (id) => apiRequest(`/answers/${id}/upvote`, {
    method: 'PUT',
  }),

  downvote: (id) => apiRequest(`/answers/${id}/downvote`, {
    method: 'PUT',
  }),
};

export const tagAPI = {
  getAll: () => apiRequest('/tags'),

  create: (name) => apiRequest('/tags', {
    method: 'POST',
    body: JSON.stringify({ tag_name: name }),
  }),

  update: (id, name) => apiRequest(`/tags/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ tag_name: name }),
  }),

  delete: (id) => apiRequest(`/tags/${id}`, {
    method: 'DELETE',
  }),
};

export const userAPI = {
  getById: (id) => apiRequest(`/users/${id}`),

  getAll: () => apiRequest('/users'),

  update: (id, data) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),

  promoteToAdmin: (id) => apiRequest(`/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role: 'admin' }),
  }),

  getStats: (id) => apiRequest(`/users/${id}/stats`),
};
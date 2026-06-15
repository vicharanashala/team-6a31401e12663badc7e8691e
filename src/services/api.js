const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// HELPER FUNCTION TO GET SESSION TOKEN - WORKS ONLY IF LOGGED IN 
const getToken = () => localStorage.getItem('token');

// GENERIC API REQUEST
async function apiRequest(endpoint, options = {}) {

  // BUILD THE REQUEST HEADER
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // ADD AUTHENTICATION TOKEN RECEIVED AT TIME OF LOGIN
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // MAIN FETCH REQUEST
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // GETTING RESPONSE AND RETURNING TO BASE REQUEST CALL
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data.data; 
}

// GENERALISED REQUEST FOR SERVER
export const get = (endpoint) => apiRequest(endpoint);
export const post = (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) });
export const put = (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) });
export const del = (endpoint) => apiRequest(endpoint, { method: 'DELETE' });
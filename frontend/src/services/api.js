import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 5000
});

export async function fetchProducts() {
  const response = await api.get('/products');
  return response.data;
}

export async function fetchProduct(id) {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

export async function loginUser(credentials) {
  const response = await api.post('/auth/login', credentials);
  return response.data;
}

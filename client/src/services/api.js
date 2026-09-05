import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

// Products
export const fetchProducts = (params = {}) => api.get('/products', { params }).then((r) => r.data);
export const fetchProduct = (id) => api.get(`/products/${id}`).then((r) => r.data);
export const fetchCategories = () => api.get('/products/categories').then((r) => r.data);

// Cart
export const fetchCart = (sessionId) => api.get(`/cart/${sessionId}`).then((r) => r.data);
export const addCartItem = (sessionId, payload) =>
  api.post(`/cart/${sessionId}/items`, payload).then((r) => r.data);
export const removeCartItem = (sessionId, productId) =>
  api.delete(`/cart/${sessionId}/items/${productId}`).then((r) => r.data);
export const updateCartItem = (sessionId, productId, quantity) =>
  api.patch(`/cart/${sessionId}/items/${productId}`, { quantity }).then((r) => r.data);
export const clearCart = (sessionId) => api.delete(`/cart/${sessionId}`).then((r) => r.data);

// AI Agent
export const sendChatMessage = (sessionId, message) =>
  api.post('/ai/chat', { sessionId, message }).then((r) => r.data);
export const fetchChatHistory = (sessionId) =>
  api.get(`/ai/history/${sessionId}`).then((r) => r.data);
export const resetChat = (sessionId) => api.delete(`/ai/history/${sessionId}`).then((r) => r.data);

// Payment
export const createPaymentOrder = (sessionId) =>
  api.post('/payment/create-order', { sessionId }).then((r) => r.data);
export const verifyPayment = (payload) => api.post('/payment/verify', payload).then((r) => r.data);
export const fetchOrder = (id) => api.get(`/payment/order/${id}`).then((r) => r.data);

// Dashboard
export const fetchDashboardSummary = () => api.get('/dashboard/summary').then((r) => r.data);
export const fetchDashboardInsights = () => api.get('/dashboard/insights').then((r) => r.data);

export default api;

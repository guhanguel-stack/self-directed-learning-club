import api from './index';

export const getBooks = (params) => api.get('/api/books', { params });
export const getBook = (bookId) => api.get(`/api/books/${bookId}`);
export const getEpubUrl = (bookId) => api.get(`/api/books/${bookId}/read`);
export const getMyLibrary = () => api.get('/api/library');
export const purchaseBook = (bookId) => api.post(`/api/library/purchase/${bookId}`);

import api from './index';

// ── 내 책장 ───────────────────────────────────────────────
/** 책 업로드 (multipart/form-data) */
export const uploadMyBook = (formData) =>
  api.post('/api/my-books/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/** 내 책장 목록 */
export const getMyBooks = () => api.get('/api/my-books/me');

/** 책 삭제 */
export const deleteMyBook = (bookId) => api.delete(`/api/my-books/${bookId}`);

// ── 서점 ─────────────────────────────────────────────────
/** 서점 목록 (keyword 검색 가능) */
export const getStoreBooks = (keyword) =>
  api.get('/api/my-books', { params: keyword ? { keyword } : {} });

/** 책 상세 */
export const getMyBook = (bookId) => api.get(`/api/my-books/${bookId}`);

// ── 교환 ─────────────────────────────────────────────────
/** 교환 요청 */
export const requestExchange = (myBookId, targetBookId) =>
  api.post('/api/exchanges', { myBookId, targetBookId });

/** 내 교환 목록 (보낸 + 받은) */
export const getMyExchanges = () => api.get('/api/exchanges/me');

/** 교환 수락 */
export const acceptExchange = (exchangeId) =>
  api.patch(`/api/exchanges/${exchangeId}/accept`);

/** 교환 거절 */
export const rejectExchange = (exchangeId) =>
  api.patch(`/api/exchanges/${exchangeId}/reject`);

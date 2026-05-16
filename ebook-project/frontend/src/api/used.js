import api from './index';

export const getUsedListings = (params) => api.get('/api/used', { params });
export const getUsedListing = (listingId) => api.get(`/api/used/${listingId}`);
export const createUsedListing = (data) => api.post('/api/used', data);
export const cancelUsedListing = (listingId) => api.delete(`/api/used/${listingId}`);
export const purchaseUsed = (listingId) => api.post(`/api/used/${listingId}/purchase`);
export const requestExchange = (listingId, offeredBookId) =>
  api.post(`/api/used/${listingId}/exchange`, { offeredBookId });
export const acceptExchange = (tradeId) => api.patch(`/api/used/exchange/${tradeId}/accept`);
export const rejectExchange = (tradeId) => api.patch(`/api/used/exchange/${tradeId}/reject`);
export const getMyTrades = () => api.get('/api/trades/me');

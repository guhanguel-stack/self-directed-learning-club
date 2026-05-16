export const formatPrice = (price) => {
  if (price == null) return '0';
  return price.toLocaleString('ko-KR');
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

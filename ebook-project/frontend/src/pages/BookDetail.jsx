import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBook, purchaseBook } from '../api/books';
import useAuthStore from '../store/authStore';
import { formatPrice } from '../utils/format';

const BookDetail = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user, updatePoint } = useAuthStore();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBook(bookId)
      .then((res) => setBook(res.data.data))
      .catch(() => navigate('/books'))
      .finally(() => setLoading(false));
  }, [bookId]);

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    try {
      await purchaseBook(bookId);
      updatePoint((user.pointBalance || 0) - book.originalPrice);
      alert('구매 완료! 내 서재에서 확인하세요.');
      navigate('/library');
    } catch (err) {
      alert(err.response?.data?.message || '구매에 실패했습니다.');
    }
  };

  if (loading) return <p className="text-center py-20 text-gray-400">로딩 중...</p>;
  if (!book) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex gap-10">
        {/* 표지 */}
        <div className="w-48 h-64 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
          {book.coverImageUrl ? (
            <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span className="text-5xl">📖</span>
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1">
          <span className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
            {book.category}
          </span>
          <h1 className="text-3xl font-bold mt-3">{book.title}</h1>
          <p className="text-gray-500 mt-1">{book.author}</p>
          <p className="text-2xl font-bold text-indigo-600 mt-4">
            {formatPrice(book.originalPrice)}P
          </p>
          <p className="text-gray-600 mt-4 leading-relaxed">{book.description}</p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handlePurchase}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700"
            >
              구매하기
            </button>
            <button
              onClick={() => navigate(`/reader/${bookId}`)}
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-medium hover:bg-gray-200"
            >
              미리보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;

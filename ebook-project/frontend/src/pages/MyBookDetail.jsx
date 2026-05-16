import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMyBook } from '../api/mybooks';
import useAuthStore from '../store/authStore';

const MyBookDetail = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyBook(bookId);
        setBook(res.data.data);
      } catch {
        setError('책 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [bookId]);

  const isMyBook = book && user && book.ownerId === user.id;

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;
  if (!book) return (
    <div className="text-center py-20">
      <p className="text-gray-500">{error || '책을 찾을 수 없습니다.'}</p>
      <button onClick={() => navigate(-1)}
        className="mt-4 text-indigo-600 hover:underline text-sm">← 뒤로</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* 뒤로 */}
      <button onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-indigo-600 mb-6 flex items-center gap-1">
        ← 목록으로
      </button>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="md:flex">
          {/* 커버 */}
          <div className="md:w-56 h-64 md:h-auto bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
            {book.imageUrl
              ? <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
              : <span className="text-white text-6xl">📖</span>}
          </div>

          {/* 상세 정보 */}
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-sm text-gray-500 mb-1">
                등록자: <span className="font-medium text-gray-700">{book.ownerNickname}</span>
              </p>
              <p className="text-sm text-gray-400 mb-4">
                {new Date(book.createdAt).toLocaleDateString('ko-KR')} 등록
              </p>

              {book.description && (
                <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4 mb-4">
                  {book.description}
                </p>
              )}

              {/* 교환 가능 여부 배지 */}
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  book.purchasedFromSite ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {book.purchasedFromSite ? '✓ 교환 가능' : '✗ 교환 불가'}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  book.status === 'AVAILABLE' ? 'bg-blue-50 text-blue-600' :
                  book.status === 'IN_EXCHANGE' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {book.status === 'AVAILABLE' ? '보유 중' :
                   book.status === 'IN_EXCHANGE' ? '교환 진행 중' : '교환 완료'}
                </span>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="mt-6 flex gap-3 flex-wrap">
              {isMyBook && (
                <Link to="/library"
                  className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                  내 서재로
                </Link>
              )}
              {book.fileUrl && (
                <a href={book.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="border border-indigo-200 text-indigo-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-50 transition">
                  📄 미리보기
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MyBookDetail;

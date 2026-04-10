import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMyBook, getMyBooks, requestExchange } from '../api/mybooks';
import useAuthStore from '../store/authStore';

const MyBookDetail = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthStore();

  const [book, setBook] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMyBookId, setSelectedMyBookId] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const openExchangeModal = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      const res = await getMyBooks();
      // purchasedFromSite=true & AVAILABLE 인 내 책만 제안 가능
      const eligible = (res.data.data || []).filter(
        b => b.purchasedFromSite && b.status === 'AVAILABLE'
      );
      setMyBooks(eligible);
      setShowModal(true);
    } catch {
      alert('내 책 목록을 불러오지 못했습니다.');
    }
  };

  const handleRequestExchange = async () => {
    if (!selectedMyBookId) { alert('제안할 책을 선택해주세요.'); return; }
    setRequesting(true);
    setError('');
    try {
      await requestExchange(selectedMyBookId, Number(bookId));
      setSuccess('교환 요청을 보냈습니다! 상대방의 수락을 기다려주세요.');
      setShowModal(false);
      // 책 상태 갱신
      const res = await getMyBook(bookId);
      setBook(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || '교환 요청에 실패했습니다.');
    } finally {
      setRequesting(false);
    }
  };

  const isMyBook = book && user && book.ownerId === user.id;
  const canExchange = book &&
    book.purchasedFromSite &&
    book.status === 'AVAILABLE' &&
    !isMyBook;

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

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 text-sm">
          ✅ {success} <Link to="/exchange" className="font-medium underline">교환 현황 보기</Link>
        </div>
      )}
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
              {isMyBook ? (
                <Link to="/my-library"
                  className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                  내 책장으로
                </Link>
              ) : canExchange ? (
                <button onClick={openExchangeModal}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm">
                  🔄 교환 요청
                </button>
              ) : (
                <button disabled
                  className="bg-gray-200 text-gray-400 px-6 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed">
                  {!book.purchasedFromSite ? '교환 불가 (직접 업로드 도서)' :
                   book.status === 'IN_EXCHANGE' ? '교환 진행 중' : '교환 완료'}
                </button>
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

      {/* 교환 요청 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">교환할 내 책 선택</h2>
            <p className="text-sm text-gray-500 mb-4">
              상대방에게 제안할 책을 선택하세요.<br />
              <span className="text-xs text-amber-600">※ 사이트에서 구매한 책만 교환 가능합니다.</span>
            </p>

            {myBooks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm mb-3">교환 가능한 책이 없습니다.</p>
                <Link to="/store" onClick={() => setShowModal(false)}
                  className="text-indigo-600 text-sm hover:underline">
                  서점에서 책 구매하기 →
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {myBooks.map(b => (
                  <label key={b.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      selectedMyBookId === b.id
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input type="radio" name="myBook" value={b.id}
                      checked={selectedMyBookId === b.id}
                      onChange={() => setSelectedMyBookId(b.id)}
                      className="accent-indigo-600" />
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {b.imageUrl
                        ? <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                        : <span className="text-white text-lg">📖</span>}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{b.title}</span>
                  </label>
                ))}
              </div>
            )}

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex gap-3">
              <button onClick={handleRequestExchange} disabled={requesting || myBooks.length === 0}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
                {requesting ? '요청 중...' : '교환 요청 보내기'}
              </button>
              <button onClick={() => { setShowModal(false); setError(''); }}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookDetail;

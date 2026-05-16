import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyLibrary } from '../api/books';
import { createUsedListing } from '../api/used';
import { formatDate } from '../utils/format';
import useAuthStore from '../store/authStore';

const Library = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  // 중고 등록 모달
  const [modal, setModal] = useState(null);
  const [priceType, setPriceType] = useState('POINT');
  const [pointPrice, setPointPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchLibrary = () => {
    setLoading(true);
    getMyLibrary()
      .then((res) => setLibrary(res.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isLoggedIn) fetchLibrary();
  }, [isLoggedIn]);

  // 같은 bookId끼리 묶기
  const groupedBooks = Object.values(
    library.reduce((acc, item) => {
      if (!acc[item.bookId]) {
        acc[item.bookId] = { ...item, count: 0, listedCount: 0 };
      }
      acc[item.bookId].count++;
      if (!item.available) acc[item.bookId].listedCount++;
      return acc;
    }, {})
  );

  const openModal = (item) => {
    setModal(item);
    setPriceType('POINT');
    setPointPrice('');
    setModalError('');
  };

  const handleListUsed = async () => {
    if (priceType === 'POINT' && (!pointPrice || Number(pointPrice) <= 0)) {
      return setModalError('포인트 가격을 입력해주세요.');
    }
    setSubmitting(true);
    setModalError('');
    try {
      await createUsedListing({
        bookId: modal.bookId,
        priceType,
        pointPrice: priceType === 'POINT' ? Number(pointPrice) : undefined,
      });
      setModal(null);
      fetchLibrary();
    } catch (err) {
      setModalError(err.response?.data?.message || '등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
        <button onClick={() => navigate('/login')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg">
          로그인
        </button>
      </div>
    );
  }

  if (loading) return <p className="text-center py-20 text-gray-400">로딩 중...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">내 서재</h1>
        <button
          onClick={() => navigate('/used')}
          className="text-sm text-indigo-600 hover:underline"
        >
          중고 마켓 보기 →
        </button>
      </div>

      {groupedBooks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">📚</p>
          <p>보유한 도서가 없습니다.</p>
          <button
            onClick={() => navigate('/books')}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            서점 둘러보기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedBooks.map((item) => {
            const availableCount = item.count - item.listedCount;
            const hasAvailable = availableCount > 0;
            return (
              <div
                key={item.bookId}
                className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.coverImageUrl ? (
                    <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover rounded" />
                  ) : (
                    <span className="text-xl">📖</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{item.title}</h3>
                    {item.count > 1 && (
                      <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                        {item.count}권
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{item.author}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.count > 1
                      ? `${availableCount}권 보유${item.listedCount > 0 ? ` · ${item.listedCount}권 거래 중` : ''}`
                      : item.listedCount > 0
                        ? '거래 중'
                        : `${formatDate(item.purchasedAt)} 구매`}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/reader/${item.bookId}`)}
                    className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-100 transition"
                  >
                    읽기
                  </button>
                  {hasAvailable ? (
                    <button
                      onClick={() => openModal(item)}
                      className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-lg text-sm hover:bg-orange-100 transition"
                    >
                      중고 등록
                    </button>
                  ) : (
                    <span className="text-xs text-orange-500 self-center px-2">전권 거래 중</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 중고 등록 모달 */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-1">중고 등록</h2>
            <p className="text-sm text-gray-500 mb-4">{modal.title}</p>

            <label className="block text-sm font-medium text-gray-700 mb-2">거래 방식</label>
            <div className="flex gap-2 mb-4">
              {[
                { value: 'POINT', label: '💰 포인트 판매' },
                { value: 'EXCHANGE', label: '🔄 교환 거래' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setPriceType(t.value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    priceType === t.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {priceType === 'POINT' && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">판매 가격 (P)</label>
                <input
                  type="number"
                  value={pointPrice}
                  onChange={(e) => setPointPrice(e.target.value)}
                  placeholder="예: 1000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </>
            )}

            {priceType === 'EXCHANGE' && (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mb-4">
                중고 마켓에 내 책을 올려두면, 다른 사용자가 자신의 책을 제안하여 교환을 신청할 수 있습니다.
              </p>
            )}

            {modalError && <p className="text-sm text-red-500 mb-3">{modalError}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleListUsed}
                disabled={submitting}
                className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;

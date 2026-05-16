import { useState, useEffect } from 'react';
import { getMyLibrary } from '../../api/books';
import { requestExchange } from '../../api/used';

const ExchangeModal = ({ listing, onClose, onSuccess }) => {
  const [myLibrary, setMyLibrary] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyLibrary()
      .then((res) => setMyLibrary(res.data.data.filter((b) => b.isAvailable)))
      .catch(() => setMyLibrary([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!selectedBookId) {
      alert('교환할 책을 선택해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await requestExchange(listing.listingId, selectedBookId);
      alert('교환 신청 완료! 판매자의 수락을 기다리세요.');
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || '교환 신청 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">교환 신청</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl"
          >
            ×
          </button>
        </div>

        {/* 원하는 책 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">원하는 책</p>
          <div className="flex gap-3 items-center">
            {listing.coverImageUrl ? (
              <img
                src={listing.coverImageUrl}
                alt={listing.title}
                className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                📖
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate">{listing.title}</p>
              <p className="text-sm text-gray-500 truncate">{listing.author}</p>
              <p className="text-xs text-gray-400 mt-0.5">판매자: {listing.sellerNickname}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400 flex-shrink-0">⇅ 교환</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <p className="font-medium mb-3 text-sm">내 서재에서 교환할 책 선택</p>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <p className="text-center text-gray-400 py-10">로딩 중...</p>
          ) : myLibrary.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-gray-600 font-medium">교환 가능한 책이 없습니다</p>
              <p className="text-gray-400 text-sm mt-1">서점에서 책을 구매한 후 교환해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {myLibrary.map((book) => (
                <button
                  key={book.bookId}
                  onClick={() => setSelectedBookId(book.bookId)}
                  className={`flex gap-3 items-center p-3 rounded-xl border-2 text-left transition-all w-full ${
                    selectedBookId === book.bookId
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-10 h-14 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center text-base flex-shrink-0">
                      📖
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{book.title}</p>
                    <p className="text-xs text-gray-500 truncate">{book.author}</p>
                  </div>
                  {selectedBookId === book.bookId && (
                    <span className="text-green-500 text-lg flex-shrink-0">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedBookId || submitting || myLibrary.length === 0}
            className="flex-1 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? '신청 중...' : '교환 신청하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeModal;

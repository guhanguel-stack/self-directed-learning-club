import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyTrades, acceptExchange, rejectExchange } from '../api/used';
import useAuthStore from '../store/authStore';
import { formatDate } from '../utils/format';

const STATUS = {
  PENDING:   { label: '수락 대기 중', className: 'bg-yellow-50 text-yellow-600' },
  COMPLETED: { label: '완료',         className: 'bg-green-50 text-green-600' },
  REJECTED:  { label: '거절됨',       className: 'bg-red-50 text-red-500' },
};

const BookCover = ({ url, alt, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-12 h-16' : 'w-16 h-20';
  return (
    <div className={`${sizeClass} rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {url
        ? <img src={url} alt={alt || ''} className="w-full h-full object-cover" />
        : <span className="text-2xl">📖</span>}
    </div>
  );
};

const TradeHistory = () => {
  const { user } = useAuthStore();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('received');
  const [processing, setProcessing] = useState(null);

  const fetchTrades = () => {
    setLoading(true);
    getMyTrades()
      .then((res) => setTrades(res.data.data))
      .catch(() => setTrades([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTrades(); }, []);

  const handleAccept = async (tradeId) => {
    if (!window.confirm('교환을 수락하시겠어요? 책 소유권이 즉시 이전됩니다.')) return;
    setProcessing(tradeId);
    try {
      await acceptExchange(tradeId);
      alert('교환 완료! 내 서재를 확인해보세요.');
      fetchTrades();
    } catch (err) {
      alert(err.response?.data?.message || '수락 실패');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (tradeId) => {
    if (!window.confirm('교환 요청을 거절하시겠어요?')) return;
    setProcessing(tradeId);
    try {
      await rejectExchange(tradeId);
      fetchTrades();
    } catch (err) {
      alert(err.response?.data?.message || '거절 실패');
    } finally {
      setProcessing(null);
    }
  };

  const received = trades.filter(
    (t) => t.sellerNickname === user?.nickname && t.tradeType === 'EXCHANGE'
  );
  const sent = trades.filter((t) => t.buyerNickname === user?.nickname);
  const pendingCount = received.filter((t) => t.status === 'PENDING').length;
  const current = tab === 'received' ? received : sent;

  if (loading) return <p className="text-center py-20 text-gray-400">로딩 중...</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">거래 내역</h1>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab('received')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
            tab === 'received'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          받은 교환 요청
          {pendingCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
            tab === 'sent'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          보낸 거래
        </button>
      </div>

      {current.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">{tab === 'received' ? '📭' : '📮'}</p>
          <p className="text-gray-400 text-sm">
            {tab === 'received' ? '받은 교환 요청이 없습니다.' : '보낸 거래 내역이 없습니다.'}
          </p>
          {tab === 'sent' && (
            <Link to="/used" className="mt-4 inline-block text-indigo-600 text-sm hover:underline">
              중고 마켓 둘러보기 →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {current.map((trade) => {
            const isSeller = trade.sellerNickname === user?.nickname;
            const statusInfo = STATUS[trade.status] ?? { label: trade.status, className: 'bg-gray-100 text-gray-500' };
            const isPending = trade.status === 'PENDING';
            const isCompleted = trade.status === 'COMPLETED';

            return (
              <div key={trade.tradeId} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-400">{formatDate(trade.tradedAt)}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {trade.tradeType === 'EXCHANGE' ? '교환 거래' : '포인트 거래'}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {trade.tradeType === 'EXCHANGE' ? (
                  /* 교환 거래: 두 책 시각화 */
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-center">
                      <BookCover url={trade.bookCoverImageUrl} alt={trade.bookTitle} />
                      <p className="text-xs font-medium text-gray-800 mt-2 line-clamp-2 leading-snug">
                        {trade.bookTitle}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{trade.sellerNickname}</p>
                    </div>

                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <span className="text-indigo-400 text-xl">⇄</span>
                      <span className="text-xs text-gray-400">교환</span>
                    </div>

                    <div className="flex-1 text-center">
                      <BookCover url={trade.offeredBookCoverImageUrl} alt={trade.offeredBookTitle} />
                      <p className="text-xs font-medium text-gray-800 mt-2 line-clamp-2 leading-snug">
                        {trade.offeredBookTitle ?? '(책 정보 없음)'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{trade.buyerNickname}</p>
                    </div>
                  </div>
                ) : (
                  /* 포인트 거래 */
                  <div className="flex items-center gap-4">
                    <BookCover url={trade.bookCoverImageUrl} alt={trade.bookTitle} size="sm" />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{trade.bookTitle}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {isSeller
                          ? `구매자: ${trade.buyerNickname}`
                          : `판매자: ${trade.sellerNickname}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* 수락/거절 버튼 */}
                {isSeller && trade.tradeType === 'EXCHANGE' && isPending && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleAccept(trade.tradeId)}
                      disabled={processing === trade.tradeId}
                      className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      {processing === trade.tradeId ? '처리 중...' : '✓ 수락'}
                    </button>
                    <button
                      onClick={() => handleReject(trade.tradeId)}
                      disabled={processing === trade.tradeId}
                      className="flex-1 border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition"
                    >
                      ✗ 거절
                    </button>
                  </div>
                )}

                {/* 구매자: 대기 중 안내 */}
                {!isSeller && trade.tradeType === 'EXCHANGE' && isPending && (
                  <p className="text-xs text-center text-gray-400 mt-4 pt-4 border-t border-gray-100">
                    판매자의 수락을 기다리고 있습니다.
                  </p>
                )}

                {/* 완료 안내 */}
                {isCompleted && (
                  <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-green-600 font-medium">거래가 완료되었습니다.</p>
                    <Link to="/library" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
                      내 서재 확인하기 →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TradeHistory;

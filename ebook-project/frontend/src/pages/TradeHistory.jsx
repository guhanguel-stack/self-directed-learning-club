import { useState, useEffect } from 'react';
import { getMyTrades, acceptExchange, rejectExchange } from '../api/used';
import useAuthStore from '../store/authStore';
import { formatDate } from '../utils/format';

const statusLabel = {
  PENDING: '대기 중',
  COMPLETED: '완료',
  REJECTED: '거절됨',
};

const TradeHistory = () => {
  const { user } = useAuthStore();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = () => {
    getMyTrades()
      .then((res) => setTrades(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleAccept = async (tradeId) => {
    if (!window.confirm('교환을 수락하시겠어요?')) return;
    try {
      await acceptExchange(tradeId);
      alert('교환 완료!');
      fetchTrades();
    } catch (err) {
      alert(err.response?.data?.message || '수락 실패');
    }
  };

  const handleReject = async (tradeId) => {
    if (!window.confirm('교환을 거절하시겠어요?')) return;
    try {
      await rejectExchange(tradeId);
      fetchTrades();
    } catch (err) {
      alert(err.response?.data?.message || '거절 실패');
    }
  };

  if (loading) return <p className="text-center py-20 text-gray-400">로딩 중...</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">거래 내역</h1>

      {trades.length === 0 ? (
        <p className="text-center text-gray-400 py-20">거래 내역이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {trades.map((trade) => {
            const isSeller = trade.sellerNickname === user?.nickname;

            return (
              <div key={trade.tradeId} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{trade.bookTitle}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {trade.tradeType === 'POINT' ? '포인트 거래' : '교환 거래'} ·{' '}
                      {isSeller ? `구매자: ${trade.buyerNickname}` : `판매자: ${trade.sellerNickname}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(trade.tradedAt)}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      trade.status === 'COMPLETED'
                        ? 'bg-green-50 text-green-600'
                        : trade.status === 'REJECTED'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-yellow-50 text-yellow-600'
                    }`}
                  >
                    {statusLabel[trade.status]}
                  </span>
                </div>

                {/* 교환 신청 대기 중이고 내가 판매자인 경우 수락/거절 버튼 */}
                {isSeller && trade.tradeType === 'EXCHANGE' && trade.status === 'PENDING' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleAccept(trade.tradeId)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700"
                    >
                      수락
                    </button>
                    <button
                      onClick={() => handleReject(trade.tradeId)}
                      className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200"
                    >
                      거절
                    </button>
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

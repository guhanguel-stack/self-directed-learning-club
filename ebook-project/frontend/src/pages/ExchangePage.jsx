import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyExchanges, acceptExchange, rejectExchange } from '../api/mybooks';
import useAuthStore from '../store/authStore';

const STATUS_LABEL = {
  REQUESTED: { text: '요청됨', color: 'bg-yellow-100 text-yellow-700' },
  ACCEPTED:  { text: '수락됨', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { text: '교환 완료', color: 'bg-green-100 text-green-700' },
  REJECTED:  { text: '거절됨', color: 'bg-red-100 text-red-600' },
};

const ExchangePage = () => {
  const { user, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('received'); // 'received' | 'sent'
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    fetchExchanges();
  }, [isLoggedIn]);

  const fetchExchanges = async () => {
    setLoading(true);
    try {
      const res = await getMyExchanges();
      setExchanges(res.data.data || []);
    } catch {
      // 에러 무시
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    if (!window.confirm('교환을 수락하시겠습니까? 책 소유권이 즉시 이전됩니다.')) return;
    setProcessing(id);
    try {
      await acceptExchange(id);
      await fetchExchanges();
    } catch (err) {
      alert(err.response?.data?.message || '처리에 실패했습니다.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('교환 요청을 거절하시겠습니까?')) return;
    setProcessing(id);
    try {
      await rejectExchange(id);
      await fetchExchanges();
    } catch (err) {
      alert(err.response?.data?.message || '처리에 실패했습니다.');
    } finally {
      setProcessing(null);
    }
  };

  const received = exchanges.filter(e => e.responderId === user?.id);
  const sent     = exchanges.filter(e => e.requesterId === user?.id);
  const current  = tab === 'received' ? received : sent;
  const pendingCount = received.filter(e => e.status === 'REQUESTED').length;

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">🔄 교환 현황</h1>
        <p className="text-sm text-gray-500 mt-1">보낸 요청과 받은 요청을 관리하세요</p>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab('received')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
            tab === 'received'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          받은 요청
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
          }`}>
          보낸 요청
        </button>
      </div>

      {/* 리스트 */}
      {current.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">{tab === 'received' ? '📭' : '📮'}</div>
          <p className="text-gray-500 text-sm">
            {tab === 'received' ? '받은 교환 요청이 없습니다.' : '보낸 교환 요청이 없습니다.'}
          </p>
          {tab === 'sent' && (
            <Link to="/store"
              className="mt-4 inline-block text-indigo-600 text-sm hover:underline">
              서점에서 책 둘러보기 →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {current.map(ex => {
            const isReceived = ex.responderId === user?.id;
            const statusInfo = STATUS_LABEL[ex.status] || { text: ex.status, color: 'bg-gray-100 text-gray-500' };

            return (
              <div key={ex.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {/* 교환 방향 표시 */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-400">
                    {new Date(ex.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>

                {/* 책 교환 시각화 */}
                <div className="flex items-center gap-3">
                  {/* 요청자 책 */}
                  <div className="flex-1 text-center">
                    <div className="w-16 h-20 mx-auto rounded-lg bg-gradient-to-br from-indigo-300 to-indigo-500 flex items-center justify-center overflow-hidden mb-2">
                      {ex.requesterBookImageUrl
                        ? <img src={ex.requesterBookImageUrl} alt=""
                            className="w-full h-full object-cover" />
                        : <span className="text-white text-2xl">📖</span>}
                    </div>
                    <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">
                      {ex.requesterBookTitle}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{ex.requesterNickname}</p>
                  </div>

                  {/* 화살표 */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-indigo-400 text-lg">⇄</div>
                    <p className="text-xs text-gray-400">교환</p>
                  </div>

                  {/* 응답자 책 */}
                  <div className="flex-1 text-center">
                    <div className="w-16 h-20 mx-auto rounded-lg bg-gradient-to-br from-purple-300 to-purple-500 flex items-center justify-center overflow-hidden mb-2">
                      {ex.responderBookImageUrl
                        ? <img src={ex.responderBookImageUrl} alt=""
                            className="w-full h-full object-cover" />
                        : <span className="text-white text-2xl">📖</span>}
                    </div>
                    <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">
                      {ex.responderBookTitle}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{ex.responderNickname}</p>
                  </div>
                </div>

                {/* 수락/거절 버튼 (받은 요청 + REQUESTED 상태일 때만) */}
                {isReceived && ex.status === 'REQUESTED' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleAccept(ex.id)}
                      disabled={processing === ex.id}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
                      {processing === ex.id ? '처리 중...' : '✓ 수락'}
                    </button>
                    <button
                      onClick={() => handleReject(ex.id)}
                      disabled={processing === ex.id}
                      className="flex-1 border border-red-200 text-red-500 py-2 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition">
                      ✗ 거절
                    </button>
                  </div>
                )}

                {/* 완료 메시지 */}
                {ex.status === 'COMPLETED' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-green-600 font-medium">
                      🎉 교환이 완료되었습니다. 내 책장을 확인해보세요!
                    </p>
                    <Link to="/library"
                      className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
                      내 책장 보기 →
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

export default ExchangePage;

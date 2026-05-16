import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUsedListing, purchaseUsed, cancelUsedListing } from '../api/used';
import useAuthStore from '../store/authStore';
import { formatPrice } from '../utils/format';
import ExchangeModal from '../components/used/ExchangeModal';

const UsedDetail = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExchangeModal, setShowExchangeModal] = useState(false);

  useEffect(() => {
    getUsedListing(listingId)
      .then((res) => setListing(res.data.data))
      .catch(() => navigate('/used'))
      .finally(() => setLoading(false));
  }, [listingId]);

  const handlePurchase = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!window.confirm(`${formatPrice(listing.pointPrice)}P로 구매하시겠어요?`)) return;
    try {
      await purchaseUsed(listingId);
      alert('구매 완료!');
      navigate('/library');
    } catch (err) {
      alert(err.response?.data?.message || '구매 실패');
    }
  };

  const handleExchangeClick = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setShowExchangeModal(true);
  };

  if (loading) return <p className="text-center py-20 text-gray-400">로딩 중...</p>;
  if (!listing) return null;

  const isMine = user?.nickname === listing.sellerNickname;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <button onClick={() => navigate(-1)} className="text-gray-500 mb-6 hover:text-gray-700">
        ← 뒤로
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex gap-6">
          <div className="w-36 h-48 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            {listing.coverImageUrl ? (
              <img src={listing.coverImageUrl} alt={listing.title} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="text-4xl">📖</span>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <p className="text-gray-500 mt-1">{listing.author}</p>
            <p className="text-sm text-gray-400 mt-2">판매자: {listing.sellerNickname}</p>

            <div className="mt-4">
              {listing.priceType === 'POINT' ? (
                <p className="text-2xl font-bold text-indigo-600">{formatPrice(listing.pointPrice)}P</p>
              ) : (
                <p className="text-2xl font-bold text-green-600">교환 거래</p>
              )}
            </div>
          </div>
        </div>

        {/* 거래 액션 */}
        {!isMine && listing.status === 'ACTIVE' && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            {listing.priceType === 'POINT' ? (
              <button
                onClick={handlePurchase}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700"
              >
                {formatPrice(listing.pointPrice)}P로 구매하기
              </button>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-3">
                  판매자가 책 교환을 원합니다. 내 서재의 책과 1:1로 교환해보세요.
                </p>
                <button
                  onClick={handleExchangeClick}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  교환 신청하기
                </button>
              </div>
            )}
          </div>
        )}

        {isMine && listing.status === 'ACTIVE' && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <button
              onClick={async () => {
                if (!window.confirm('등록을 취소하시겠어요?')) return;
                await cancelUsedListing(listingId);
                alert('취소되었습니다.');
                navigate('/library');
              }}
              className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-medium hover:bg-red-100"
            >
              등록 취소
            </button>
          </div>
        )}

        {listing.status !== 'ACTIVE' && (
          <div className="mt-8 border-t border-gray-100 pt-6 text-center text-gray-400">
            {listing.status === 'COMPLETED' ? '거래가 완료된 상품입니다.' : '거래가 취소된 상품입니다.'}
          </div>
        )}
      </div>

      {showExchangeModal && (
        <ExchangeModal
          listing={listing}
          onClose={() => setShowExchangeModal(false)}
          onSuccess={() => {
            setShowExchangeModal(false);
            navigate('/trades');
          }}
        />
      )}
    </div>
  );
};

export default UsedDetail;

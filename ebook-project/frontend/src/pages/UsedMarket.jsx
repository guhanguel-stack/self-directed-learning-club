import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsedListings } from '../api/used';
import UsedCard from '../components/used/UsedCard';
import ExchangeModal from '../components/used/ExchangeModal';
import useAuthStore from '../store/authStore';

const UsedMarket = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [priceType, setPriceType] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exchangeTarget, setExchangeTarget] = useState(null);

  const handleExchangeClick = (listing) => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setExchangeTarget(listing);
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await getUsedListings({
        keyword: keyword || undefined,
        priceType: priceType || undefined,
        page,
        size: 12,
      });
      setListings(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, priceType]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchListings();
  };

  const visibleListings = listings.filter(
    (l) => !user || l.sellerNickname !== user.nickname
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">중고 마켓</h1>
        {isLoggedIn && (
          <button
            onClick={() => navigate('/library')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            내 책 등록하기
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="책 제목 또는 저자 검색"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
          검색
        </button>
      </form>

      <div className="flex gap-2 mb-6">
        {[
          { value: '', label: '전체' },
          { value: 'POINT', label: '포인트 거래' },
          { value: 'EXCHANGE', label: '교환 거래' },
        ].map((type) => (
          <button
            key={type.value}
            onClick={() => { setPriceType(type.value); setPage(0); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              priceType === type.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-20">로딩 중...</p>
      ) : visibleListings.length === 0 ? (
        <p className="text-center text-gray-400 py-20">등록된 중고 도서가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleListings.map((listing) => (
            <UsedCard key={listing.listingId} listing={listing} onExchange={handleExchangeClick} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${
                page === i ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {exchangeTarget && (
        <ExchangeModal
          listing={exchangeTarget}
          onClose={() => setExchangeTarget(null)}
          onSuccess={() => {
            setExchangeTarget(null);
            navigate('/trades');
          }}
        />
      )}
    </div>
  );
};

export default UsedMarket;

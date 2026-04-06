import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyLibrary } from '../api/books';
import { createUsedListing } from '../api/used';
import { formatPrice, formatDate } from '../utils/format';

const Library = () => {
  const navigate = useNavigate();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyLibrary()
      .then((res) => setLibrary(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleListUsed = async (item) => {
    const priceType = window.confirm('포인트 판매를 선택하시겠어요?\n(확인: 포인트, 취소: 교환)')
      ? 'POINT'
      : 'EXCHANGE';

    let pointPrice = null;
    if (priceType === 'POINT') {
      const input = prompt('판매 포인트를 입력하세요:');
      if (!input || isNaN(Number(input))) return;
      pointPrice = Number(input);
    }

    try {
      await createUsedListing({ bookId: item.bookId, priceType, pointPrice });
      alert('중고 등록이 완료되었습니다.');
      const res = await getMyLibrary();
      setLibrary(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || '등록에 실패했습니다.');
    }
  };

  if (loading) return <p className="text-center py-20 text-gray-400">로딩 중...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">내 서재</h1>

      {library.length === 0 ? (
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
          {library.map((item) => (
            <div
              key={item.libraryId}
              className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100"
            >
              <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                {item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover rounded" />
                ) : (
                  <span className="text-xl">📖</span>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.author}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.purchasedAt)} 구매</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/reader/${item.bookId}`)}
                  className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-100"
                >
                  읽기
                </button>
                {item.isAvailable ? (
                  <button
                    onClick={() => handleListUsed(item)}
                    className="bg-gray-50 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-100"
                  >
                    중고 등록
                  </button>
                ) : (
                  <span className="text-xs text-orange-500 self-center">거래 중</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStoreBooks } from '../api/mybooks';

const Store = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState('');

  const fetchBooks = async (kw) => {
    setLoading(true);
    setError('');
    try {
      const res = await getStoreBooks(kw);
      setBooks(res.data.data || []);
    } catch {
      setError('책 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(keyword); }, [keyword]);

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">🏪 서점</h1>
        <p className="text-sm text-gray-500 mt-1">다른 사용자들의 책을 탐색하고 교환해보세요</p>
      </div>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="책 제목으로 검색..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit"
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
          검색
        </button>
        {keyword && (
          <button type="button" onClick={() => { setKeyword(''); setSearchInput(''); }}
            className="border border-gray-300 text-gray-500 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
            초기화
          </button>
        )}
      </form>

      {/* 에러 */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6">{error}</div>
      )}

      {/* 결과 카운트 */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-4">
          {keyword ? `"${keyword}" 검색 결과 ` : '전체 '}
          <span className="font-semibold text-gray-800">{books.length}권</span>
        </p>
      )}

      {/* 책 그리드 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500">
            {keyword ? `"${keyword}"에 해당하는 책이 없습니다.` : '등록된 책이 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {books.map(book => (
            <Link key={book.id} to={`/my-book/${book.id}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition group">
              {/* 커버 */}
              <div className="h-44 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center overflow-hidden">
                {book.imageUrl
                  ? <img src={book.imageUrl} alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition" />
                  : <span className="text-white text-4xl">📖</span>}
              </div>

              {/* 정보 */}
              <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug mb-1">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-400 mb-2">by {book.ownerNickname}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    book.purchasedFromSite && book.status === 'AVAILABLE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {book.purchasedFromSite && book.status === 'AVAILABLE'
                      ? '교환 가능'
                      : '교환 불가'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Store;

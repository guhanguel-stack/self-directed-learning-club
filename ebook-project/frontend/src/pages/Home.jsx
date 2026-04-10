import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const POPULAR_BOOKS = [
  { id: 1, title: '파우스트', author: '괴테', genre: '고전문학', price: 3000 },
  { id: 2, title: '데미안', author: '헤르만 헤세', genre: '성장소설', price: 2500 },
  { id: 3, title: '변신', author: '카프카', genre: '단편소설', price: 1500 },
  { id: 4, title: '죄와 벌', author: '도스토예프스키', genre: '심리소설', price: 4000 },
  { id: 5, title: '노인과 바다', author: '헤밍웨이', genre: '단편소설', price: 2000 },
  { id: 6, title: '어린 왕자', author: '생텍쥐페리', genre: '동화', price: 1000 },
];

const FEATURES = [
  { icon: '🔒', title: '저작권 안전', desc: '퍼블릭 도메인 도서만 취급합니다.' },
  { icon: '💰', title: '포인트 거래', desc: '보유 포인트로 중고책을 구매하세요.' },
  { icon: '🔄', title: '1:1 교환', desc: '내 책과 원하는 책을 바꿔보세요.' },
];

const GENRE_COLORS = {
  '고전문학': 'bg-purple-100 text-purple-700',
  '성장소설': 'bg-blue-100 text-blue-700',
  '단편소설': 'bg-green-100 text-green-700',
  '심리소설': 'bg-red-100 text-red-700',
  '동화': 'bg-yellow-100 text-yellow-700',
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero 섹션 ── */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            퍼블릭 도메인 전자책<br />
            <span className="text-indigo-200">사고 팔고 교환하기</span>
          </h1>
          <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto">
            읽고 난 전자책을 포인트로 판매하거나, 다른 책과 1:1 교환해보세요.
          </p>

          {/* 검색 바 */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="책 제목, 저자 검색..."
              className="flex-1 px-5 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-md"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition shadow-md text-sm"
            >
              검색
            </button>
          </form>

          {/* CTA 버튼 */}
          <div className="flex gap-4 justify-center mt-8 flex-wrap">
            <Link
              to="/books"
              className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition shadow-md text-sm"
            >
              📖 서점 둘러보기
            </Link>
            <Link
              to="/used"
              className="bg-indigo-500 bg-opacity-50 text-white px-8 py-3 rounded-xl font-semibold border border-indigo-300 hover:bg-opacity-70 transition text-sm"
            >
              🛍️ 중고 마켓 보기
            </Link>
            {!user && (
              <Link
                to="/register"
                className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition shadow-md text-sm"
              >
                🚀 무료로 시작하기
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── 기능 소개 ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
          EBookMarket이 특별한 이유
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 인기 도서 ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">🔥 인기 도서</h2>
            <Link
              to="/books"
              className="text-sm text-indigo-600 font-medium hover:underline"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {POPULAR_BOOKS.map((book) => (
              <Link
                key={book.id}
                to="/books"
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition group"
              >
                {/* 책 커버 */}
                <div className="h-28 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mb-3 group-hover:opacity-90 transition">
                  <span className="text-white text-3xl">📖</span>
                </div>
                <div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${GENRE_COLORS[book.genre] || 'bg-gray-100 text-gray-600'}`}>
                    {book.genre}
                  </span>
                  <h4 className="font-semibold text-gray-900 mt-1.5 text-sm leading-snug line-clamp-1">
                    {book.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                  <p className="text-indigo-600 font-bold text-sm mt-2">
                    {book.price.toLocaleString()}P
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 하단 CTA ── */}
      {!user && (
        <section className="bg-indigo-600 text-white py-16 text-center">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-3">지금 바로 시작해보세요</h2>
            <p className="text-indigo-200 mb-8 text-base">
              무료로 가입하고 전자책을 사고팔고 교환해보세요.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/register"
                className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition text-sm"
              >
                회원가입
              </Link>
              <Link
                to="/login"
                className="border border-indigo-300 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-500 transition text-sm"
              >
                로그인
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

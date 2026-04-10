import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { logout } from '../../api/auth';
import { formatPrice } from '../../utils/format';

const Header = () => {
  const { user, isLoggedIn, logout: logoutStore } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try { await logout(); } finally {
      logoutStore();
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition ${
        isActive(to)
          ? 'text-indigo-600'
          : 'text-gray-600 hover:text-indigo-600'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* 로고 */}
        <Link to="/" className="text-xl font-bold text-indigo-600 flex items-center gap-1">
          📚 EBookMarket
        </Link>

        {/* 데스크탑 nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLink('/store',      '서점')}
          {navLink('/books',      '공개도서')}
          {navLink('/used',       '중고마켓')}

          {isLoggedIn ? (
            <>
              {navLink('/my-library', '내 책장')}
              {navLink('/exchange',   '교환 현황')}
              {navLink('/library',    '내 서재')}
              <span className="text-indigo-600 font-semibold text-sm">
                {formatPrice(user?.pointBalance)}P
              </span>
              <span className="text-gray-500 text-sm">{user?.nickname}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-red-500 transition"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="text-sm text-gray-600 hover:text-indigo-600 transition">
                로그인
              </Link>
              <Link to="/register"
                className="bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition">
                회원가입
              </Link>
            </>
          )}
        </nav>

        {/* 모바일 햄버거 */}
        <button
          className="md:hidden text-gray-500 hover:text-gray-700"
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-4">
          <Link to="/store"      onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">서점</Link>
          <Link to="/books"      onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">공개도서</Link>
          <Link to="/used"       onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">중고마켓</Link>
          {isLoggedIn ? (
            <>
              <Link to="/my-library" onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">내 책장</Link>
              <Link to="/exchange"   onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">교환 현황</Link>
              <Link to="/library"    onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">내 서재</Link>
              <button onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="text-sm text-red-500 text-left">로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">로그인</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">회원가입</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

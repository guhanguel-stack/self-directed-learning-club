import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { logout } from '../../api/auth';
import { formatPrice } from '../../utils/format';

const Header = () => {
  const { user, isLoggedIn, logout: logoutStore } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      logoutStore();
      navigate('/');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          📚 EBookMarket
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link to="/books" className="text-gray-600 hover:text-indigo-600">서점</Link>
          <Link to="/used" className="text-gray-600 hover:text-indigo-600">중고마켓</Link>

          {isLoggedIn ? (
            <>
              <Link to="/library" className="text-gray-600 hover:text-indigo-600">내 서재</Link>
              <Link to="/trades" className="text-gray-600 hover:text-indigo-600">거래 내역</Link>
              <span className="text-indigo-600 font-medium">
                {formatPrice(user?.pointBalance)}P
              </span>
              <span className="text-gray-500">{user?.nickname}</span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-500"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-indigo-600">로그인</Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

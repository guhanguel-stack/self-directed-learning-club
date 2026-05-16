import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { logout, chargePoint } from '../../api/auth';
import { formatPrice } from '../../utils/format';

const Header = () => {
  const { user, isLoggedIn, logout: logoutStore } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [chargeAmount, setChargeAmount] = useState('');
  const [charging, setCharging] = useState(false);
  const { updatePoint } = useAuthStore();

  const handleCharge = async () => {
    const amount = Number(chargeAmount);
    if (!amount || amount <= 0) return alert('충전할 금액을 입력해주세요.');
    setCharging(true);
    try {
      await chargePoint(amount);
      updatePoint((user?.pointBalance || 0) + amount);
      setShowChargeModal(false);
      setChargeAmount('');
      alert(`${formatPrice(amount)}P 충전 완료!`);
    } catch (e) {
      alert('충전에 실패했습니다.');
    } finally {
      setCharging(false);
    }
  };

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
    <>
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* 로고 */}
        <Link to="/" className="text-xl font-bold text-indigo-600 flex items-center gap-1">
          📚 EBookMarket
        </Link>

        {/* 데스크탑 nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLink('/books',      '서점')}
          {navLink('/used',       '중고마켓')}

          {isLoggedIn ? (
            <>
              {navLink('/library',    '내 서재')}
              {navLink('/exchange',   '교환 현황')}
              <button
                onClick={() => setShowChargeModal(true)}
                className="text-indigo-600 font-semibold text-sm hover:underline"
                title="클릭하여 포인트 충전"
              >
                {formatPrice(user?.pointBalance)}P
              </button>
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
          <Link to="/books"      onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">서점</Link>
          <Link to="/used"       onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">중고마켓</Link>
          {isLoggedIn ? (
            <>
              <Link to="/library"    onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">내 서재</Link>
              <Link to="/exchange"   onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">교환 현황</Link>
              <button
                onClick={() => { setMenuOpen(false); setShowChargeModal(true); }}
                className="text-sm text-indigo-600 font-semibold text-left"
              >
                💰 {formatPrice(user?.pointBalance)}P 충전하기
              </button>
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

    {/* 포인트 충전 모달 — header 와 Fragment로 묶음 */}
    {showChargeModal && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
          <h2 className="text-lg font-bold text-gray-800 mb-1">포인트 충전</h2>
          <p className="text-sm text-gray-500 mb-4">
            현재 보유: <span className="font-semibold text-indigo-600">{formatPrice(user?.pointBalance)}P</span>
          </p>
          <div className="flex gap-2 mb-3">
            {[1000, 3000, 5000, 10000].map(v => (
              <button
                key={v}
                onClick={() => setChargeAmount(String(v))}
                className="flex-1 text-xs border border-indigo-200 text-indigo-600 rounded-lg py-1.5 hover:bg-indigo-50 transition"
              >
                {formatPrice(v)}P
              </button>
            ))}
          </div>
          <input
            type="number"
            value={chargeAmount}
            onChange={e => setChargeAmount(e.target.value)}
            placeholder="직접 입력 (P)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowChargeModal(false); setChargeAmount(''); }}
              className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleCharge}
              disabled={charging}
              className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {charging ? '충전 중...' : '충전하기'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Header;

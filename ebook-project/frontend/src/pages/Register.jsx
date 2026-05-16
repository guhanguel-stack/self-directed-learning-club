import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, checkNickname, warmupServer } from '../api/auth';

const PW_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
  });
  const [errors, setErrors] = useState({});
  const [nicknameStatus, setNicknameStatus] = useState(null); // null | 'available' | 'taken' | 'checking' | 'slow'
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { warmupServer(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // 닉네임이 바뀌면 중복 확인 초기화
    if (name === 'nickname') setNicknameStatus(null);
    // 실시간 에러 초기화
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validatePassword = (pw) => {
    if (!pw) return '비밀번호를 입력해주세요.';
    if (pw.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    if (!PW_REGEX.test(pw)) return '영문과 숫자를 모두 포함해야 합니다.';
    return '';
  };

  const handlePasswordBlur = () => {
    const msg = validatePassword(form.password);
    setErrors((prev) => ({ ...prev, password: msg }));
  };

  const handlePasswordConfirmBlur = () => {
    if (form.passwordConfirm && form.password !== form.passwordConfirm) {
      setErrors((prev) => ({ ...prev, passwordConfirm: '비밀번호가 일치하지 않습니다.' }));
    } else {
      setErrors((prev) => ({ ...prev, passwordConfirm: '' }));
    }
  };

  const handleCheckNickname = async () => {
    const nick = form.nickname.trim();
    if (!nick) {
      setErrors((prev) => ({ ...prev, nickname: '닉네임을 입력해주세요.' }));
      return;
    }
    if (nick.length < 2 || nick.length > 30) {
      setErrors((prev) => ({ ...prev, nickname: '닉네임은 2~30자 사이여야 합니다.' }));
      return;
    }
    setNicknameStatus('checking');
    const slowTimer = setTimeout(() => setNicknameStatus('slow'), 5000);
    try {
      const res = await checkNickname(nick);
      const available = res.data?.data?.available ?? res.data?.available;
      setNicknameStatus(available ? 'available' : 'taken');
    } catch (err) {
      setNicknameStatus(null);
      const msg = err.code === 'ECONNABORTED'
        ? '서버 응답이 느립니다. 잠시 후 다시 시도해주세요.'
        : '중복 확인 중 오류가 발생했습니다.';
      setErrors((prev) => ({ ...prev, nickname: msg }));
    } finally {
      clearTimeout(slowTimer);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = '이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = '이메일 형식이 올바르지 않습니다.';

    const pwErr = validatePassword(form.password);
    if (pwErr) newErrors.password = pwErr;

    if (!form.passwordConfirm) newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    else if (form.password !== form.passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';

    if (!form.nickname) newErrors.nickname = '닉네임을 입력해주세요.';
    else if (nicknameStatus !== 'available') newErrors.nickname = '닉네임 중복 확인을 완료해주세요.';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        nickname: form.nickname.trim(),
      });
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      setSubmitError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = (() => {
    const pw = form.password;
    if (!pw) return null;
    if (pw.length < 8) return { level: 1, label: '너무 짧음', color: 'bg-red-400' };
    if (!PW_REGEX.test(pw)) return { level: 2, label: '영문/숫자 필요', color: 'bg-yellow-400' };
    if (pw.length >= 12) return { level: 4, label: '강력함', color: 'bg-green-500' };
    return { level: 3, label: '적절함', color: 'bg-blue-400' };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📚</div>
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-sm text-gray-500 mt-1">EBookMarket에 오신 것을 환영합니다</p>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-5 text-sm flex items-center gap-2">
            <span>⚠️</span> {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 <span className="text-gray-400 font-normal">(영문+숫자, 8자 이상)</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handlePasswordBlur}
              placeholder="영문과 숫자를 포함하여 입력"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {/* 비밀번호 강도 바 */}
            {pwStrength && (
              <div className="mt-2">
                <div className="flex gap-1 h-1.5 mb-1">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={`flex-1 rounded-full transition-all ${
                        n <= pwStrength.level ? pwStrength.color : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${pwStrength.level >= 3 ? 'text-green-600' : pwStrength.level === 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {pwStrength.label}
                </p>
              </div>
            )}
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
            <input
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              onBlur={handlePasswordConfirmBlur}
              placeholder="비밀번호를 다시 입력해주세요"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.passwordConfirm
                  ? 'border-red-400 bg-red-50'
                  : form.passwordConfirm && form.password === form.passwordConfirm
                  ? 'border-green-400'
                  : 'border-gray-300'
              }`}
            />
            {form.passwordConfirm && form.password === form.passwordConfirm && !errors.passwordConfirm && (
              <p className="text-green-600 text-xs mt-1">✓ 비밀번호가 일치합니다.</p>
            )}
            {errors.passwordConfirm && <p className="text-red-500 text-xs mt-1">{errors.passwordConfirm}</p>}
          </div>

          {/* 닉네임 + 중복확인 버튼 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">닉네임 (2~30자)</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                placeholder="사용할 닉네임 입력"
                className={`flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.nickname
                    ? 'border-red-400 bg-red-50'
                    : nicknameStatus === 'available'
                    ? 'border-green-400'
                    : nicknameStatus === 'taken'
                    ? 'border-red-400'
                    : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={nicknameStatus === 'checking' || nicknameStatus === 'slow'}
                className="px-4 py-2.5 text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 whitespace-nowrap transition"
              >
                {nicknameStatus === 'slow' ? '서버 시작 중...' : nicknameStatus === 'checking' ? '확인 중...' : '중복 확인'}
              </button>
            </div>
            {nicknameStatus === 'available' && (
              <p className="text-green-600 text-xs mt-1">✓ 사용 가능한 닉네임입니다.</p>
            )}
            {nicknameStatus === 'taken' && (
              <p className="text-red-500 text-xs mt-1">✗ 이미 사용 중인 닉네임입니다.</p>
            )}
            {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition text-sm mt-2"
          >
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

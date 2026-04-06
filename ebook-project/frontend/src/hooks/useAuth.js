import { useEffect } from 'react';
import { getMyInfo } from '../api/auth';
import useAuthStore from '../store/authStore';
import { getAccessToken } from '../utils/token';

// 앱 시작 시 로그인 상태 복원
const useAuth = () => {
  const { setUser, isLoggedIn } = useAuthStore();

  useEffect(() => {
    const token = getAccessToken();
    if (token && !isLoggedIn) {
      getMyInfo()
        .then((res) => setUser(res.data.data))
        .catch(() => {});
    }
  }, []);

  return useAuthStore();
};

export default useAuth;

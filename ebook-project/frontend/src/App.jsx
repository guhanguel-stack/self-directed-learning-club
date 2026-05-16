import { Outlet } from 'react-router-dom';
import Header from './components/common/Header';
import useAuth from './hooks/useAuth';

const App = () => {
  useAuth(); // 앱 시작 시 로그인 상태 복원

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default App;

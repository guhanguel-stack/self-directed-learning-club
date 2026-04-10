import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import BookList from '../pages/BookList';
import BookDetail from '../pages/BookDetail';
import Library from '../pages/Library';
import Reader from '../pages/Reader';
import UsedMarket from '../pages/UsedMarket';
import UsedDetail from '../pages/UsedDetail';
import TradeHistory from '../pages/TradeHistory';
import MyLibrary from '../pages/MyLibrary';
import Store from '../pages/Store';
import MyBookDetail from '../pages/MyBookDetail';
import ExchangePage from '../pages/ExchangePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true,                element: <Home /> },
      { path: 'login',              element: <Login /> },
      { path: 'register',           element: <Register /> },
      // 기존 서점/서재
      { path: 'books',              element: <BookList /> },
      { path: 'books/:bookId',      element: <BookDetail /> },
      { path: 'library',            element: <Library /> },
      // 기존 중고마켓
      { path: 'used',               element: <UsedMarket /> },
      { path: 'used/:listingId',    element: <UsedDetail /> },
      { path: 'trades',             element: <TradeHistory /> },
      // 새 기능
      { path: 'my-library',         element: <MyLibrary /> },
      { path: 'store',              element: <Store /> },
      { path: 'my-book/:bookId',    element: <MyBookDetail /> },
      { path: 'exchange',           element: <ExchangePage /> },
    ],
  },
  // Reader는 전체화면이라 레이아웃 밖에 배치
  { path: '/reader/:bookId', element: <Reader /> },
]);

export default router;

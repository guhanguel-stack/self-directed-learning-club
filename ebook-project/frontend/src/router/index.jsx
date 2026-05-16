import { createBrowserRouter, Navigate } from 'react-router-dom';
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
      { path: 'books',              element: <BookList /> },
      { path: 'books/:bookId',      element: <BookDetail /> },
      { path: 'library',            element: <Library /> },
      { path: 'my-library',         element: <Navigate to="/library" replace /> },
      { path: 'used',               element: <UsedMarket /> },
      { path: 'used/:listingId',    element: <UsedDetail /> },
      { path: 'trades',             element: <TradeHistory /> },
      { path: 'store',              element: <Navigate to="/books" replace /> },
      { path: 'my-book/:bookId',    element: <MyBookDetail /> },
      { path: 'exchange',           element: <ExchangePage /> },
    ],
  },
  { path: '/reader/:bookId', element: <Reader /> },
]);

export default router;

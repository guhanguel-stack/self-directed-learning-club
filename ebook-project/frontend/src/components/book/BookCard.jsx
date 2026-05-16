import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';

const BookCard = ({ book }) => {
  return (
    <Link to={`/books/${book.id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="bg-gray-100 h-48 flex items-center justify-center">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-4xl">📖</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{book.author}</p>
          <p className="text-indigo-600 font-medium mt-2">
            {formatPrice(book.originalPrice)}P
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;

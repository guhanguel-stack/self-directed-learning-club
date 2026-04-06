import { useState, useEffect } from 'react';
import { getBooks } from '../api/books';
import BookCard from '../components/book/BookCard';

const CATEGORIES = [
  { value: '', label: '전체' },
  { value: 'NOVEL', label: '소설' },
  { value: 'POETRY', label: '시' },
  { value: 'ESSAY', label: '에세이' },
  { value: 'HISTORY', label: '역사' },
  { value: 'PHILOSOPHY', label: '철학' },
  { value: 'SCIENCE', label: '과학' },
  { value: 'OTHER', label: '기타' },
];

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await getBooks({ keyword: keyword || undefined, category: category || undefined, page, size: 12 });
      setBooks(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchBooks();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">서점</h1>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="책 제목 또는 저자 검색"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          검색
        </button>
      </form>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => { setCategory(cat.value); setPage(0); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 도서 목록 */}
      {loading ? (
        <p className="text-center text-gray-400 py-20">로딩 중...</p>
      ) : books.length === 0 ? (
        <p className="text-center text-gray-400 py-20">도서가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${
                page === i ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;

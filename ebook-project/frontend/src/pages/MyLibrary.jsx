import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getMyBooks, uploadMyBook, deleteMyBook } from '../api/mybooks';
import useAuthStore from '../store/authStore';

const MyLibrary = () => {
  const { isLoggedIn } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ title: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const imageRef = useRef();
  const pdfRef = useRef();

  const fetchBooks = async () => {
    try {
      const res = await getMyBooks();
      setBooks(res.data.data || []);
    } catch {
      setError('책 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isLoggedIn) fetchBooks(); }, [isLoggedIn]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('책 제목을 입력해주세요.'); return; }

    setUploading(true);
    setError('');
    const fd = new FormData();
    fd.append('title', form.title.trim());
    fd.append('description', form.description.trim());
    if (imageFile) fd.append('image', imageFile);
    if (pdfFile)   fd.append('file', pdfFile);

    try {
      await uploadMyBook(fd);
      setForm({ title: '', description: '' });
      setImageFile(null);
      setPdfFile(null);
      setShowUpload(false);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || '업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('이 책을 삭제하시겠습니까?')) return;
    try {
      await deleteMyBook(bookId);
      setBooks(prev => prev.filter(b => b.id !== bookId));
    } catch (err) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  if (!isLoggedIn) return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
      <Link to="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-lg">로그인</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📚 내 책장</h1>
          <p className="text-sm text-gray-500 mt-1">내가 등록한 책 목록</p>
        </div>
        <button
          onClick={() => { setShowUpload(v => !v); setError(''); }}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
        >
          {showUpload ? '닫기' : '+ 책 등록'}
        </button>
      </div>

      {/* 업로드 폼 */}
      {showUpload && (
        <form onSubmit={handleUpload}
          className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">새 책 등록</h2>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">책 제목 *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="책 제목 입력"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">책 설명</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="책에 대한 설명 입력"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">표지 이미지</label>
              <div
                onClick={() => imageRef.current.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition"
              >
                {imageFile
                  ? <p className="text-sm text-indigo-600">{imageFile.name}</p>
                  : <p className="text-sm text-gray-400">클릭하여 이미지 선택</p>}
              </div>
              <input ref={imageRef} type="file" accept="image/*" className="hidden"
                onChange={e => setImageFile(e.target.files[0])} />
            </div>

            {/* PDF 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">책 파일 (PDF)</label>
              <div
                onClick={() => pdfRef.current.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition"
              >
                {pdfFile
                  ? <p className="text-sm text-indigo-600">{pdfFile.name}</p>
                  : <p className="text-sm text-gray-400">클릭하여 PDF 선택</p>}
              </div>
              <input ref={pdfRef} type="file" accept=".pdf,application/pdf" className="hidden"
                onChange={e => setPdfFile(e.target.files[0])} />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={uploading}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
              {uploading ? '업로드 중...' : '등록 완료'}
            </button>
            <button type="button" onClick={() => setShowUpload(false)}
              className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
              취소
            </button>
          </div>
        </form>
      )}

      {/* 책 목록 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 mb-2">등록된 책이 없습니다.</p>
          <p className="text-sm text-gray-400">위의 '책 등록' 버튼으로 책을 추가해보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {books.map(book => (
            <div key={book.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">
              {/* 커버 */}
              <Link to={`/my-book/${book.id}`}>
                <div className="h-40 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center overflow-hidden">
                  {book.imageUrl
                    ? <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                    : <span className="text-white text-4xl">📖</span>}
                </div>
              </Link>
              <div className="p-3">
                <div className="flex items-start justify-between gap-1">
                  <Link to={`/my-book/${book.id}`}
                    className="font-semibold text-sm text-gray-900 line-clamp-2 hover:text-indigo-600 leading-snug flex-1">
                    {book.title}
                  </Link>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    book.purchasedFromSite
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {book.purchasedFromSite ? '교환 가능' : '교환 불가'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    book.status === 'AVAILABLE' ? 'bg-blue-50 text-blue-600' :
                    book.status === 'IN_EXCHANGE' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {book.status === 'AVAILABLE' ? '보유 중' :
                     book.status === 'IN_EXCHANGE' ? '교환 중' : '완료'}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(book.id)}
                  className="mt-2 w-full text-xs text-red-400 hover:text-red-600 py-1 border border-red-100 rounded-lg hover:bg-red-50 transition"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLibrary;

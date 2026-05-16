import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEpubUrl } from '../api/books';
import ePub from 'epubjs';

const Reader = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const viewerRef = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    let isMounted = true;

    getEpubUrl(bookId)
      .then((res) => {
        if (!isMounted) return;
        const epubUrl = res.data.data;

        bookRef.current = ePub(epubUrl);
        renditionRef.current = bookRef.current.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
        });
        renditionRef.current.display();
      })
      .catch(() => {
        alert('epub을 불러오는 데 실패했습니다.');
        navigate(-1);
      });

    return () => {
      isMounted = false;
      bookRef.current?.destroy();
    };
  }, [bookId]);

  const changeFontSize = (delta) => {
    setFontSize((prev) => {
      const next = Math.min(Math.max(prev + delta, 12), 28);
      renditionRef.current?.themes.fontSize(`${next}px`);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 상단 툴바 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          ← 돌아가기
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeFontSize(-2)}
            className="w-8 h-8 rounded-lg bg-gray-100 text-sm hover:bg-gray-200"
          >
            A-
          </button>
          <span className="text-sm text-gray-500">{fontSize}px</span>
          <button
            onClick={() => changeFontSize(2)}
            className="w-8 h-8 rounded-lg bg-gray-100 text-sm hover:bg-gray-200"
          >
            A+
          </button>
        </div>
      </div>

      {/* epub 뷰어 */}
      <div className="flex-1 overflow-hidden">
        <div ref={viewerRef} className="w-full h-full max-w-3xl mx-auto bg-white shadow-sm" />
      </div>

      {/* 하단 페이지 이동 */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex justify-between">
        <button
          onClick={() => renditionRef.current?.prev()}
          className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          ← 이전
        </button>
        <button
          onClick={() => renditionRef.current?.next()}
          className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          다음 →
        </button>
      </div>
    </div>
  );
};

export default Reader;

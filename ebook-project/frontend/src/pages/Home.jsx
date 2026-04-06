import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        📚 EBookMarket
      </h1>
      <p className="text-xl text-gray-500 mb-2">퍼블릭 도메인 전자책 중고거래 플랫폼</p>
      <p className="text-gray-400 mb-10">
        읽고 난 전자책을 포인트로 판매하거나 다른 책과 교환해보세요.
      </p>

      <div className="flex gap-4 justify-center">
        <Link
          to="/books"
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700"
        >
          서점 둘러보기
        </Link>
        <Link
          to="/used"
          className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-medium border border-indigo-200 hover:bg-indigo-50"
        >
          중고 마켓 보기
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-16">
        {[
          { icon: '🔒', title: '저작권 안전', desc: '퍼블릭 도메인 도서만 취급합니다.' },
          { icon: '💰', title: '포인트 거래', desc: '보유 포인트로 중고책을 구매하세요.' },
          { icon: '🔄', title: '1:1 교환', desc: '내 책과 원하는 책을 바꿔보세요.' },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;

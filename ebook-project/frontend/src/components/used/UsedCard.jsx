import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';

const UsedCard = ({ listing }) => {
  const priceLabel =
    listing.priceType === 'POINT'
      ? `${formatPrice(listing.pointPrice)}P`
      : '교환';

  return (
    <Link to={`/used/${listing.listingId}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="bg-gray-100 h-48 flex items-center justify-center">
          {listing.coverImageUrl ? (
            <img
              src={listing.coverImageUrl}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-4xl">📖</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{listing.author}</p>
          <div className="flex items-center justify-between mt-2">
            <span
              className={`font-medium ${
                listing.priceType === 'EXCHANGE'
                  ? 'text-green-600'
                  : 'text-indigo-600'
              }`}
            >
              {priceLabel}
            </span>
            <span className="text-xs text-gray-400">{listing.sellerNickname}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UsedCard;

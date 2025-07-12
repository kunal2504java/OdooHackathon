import React from 'react';

const ItemCard = ({ item, navigate }) => {
  // Fallback image in case the item's image is missing
  const imageUrl = item.images?.[0] || 'https://placehold.co/400x400/1a202c/4ade80?text=ReWear';

  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-green-500/20 transition-all duration-300 cursor-pointer group transform hover:-translate-y-2"
      onClick={() => navigate('itemDetail', item.id)}
    >
      {/* Item Image */}
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={item.title} 
          className="w-full h-64 object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x400/1a202c/4ade80?text=Image+Error'; }}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
      </div>
      
      {/* Item Details */}
      <div className="p-4">
        <h4 className="font-bold text-lg truncate text-gray-50 group-hover:text-green-400 transition-colors">{item.title}</h4>
        <p className="text-sm text-gray-400">{item.category}</p>
        <div className="mt-2 text-right text-green-400 font-semibold">{item.size}</div>
      </div>
    </div>
  );
};

export default ItemCard;

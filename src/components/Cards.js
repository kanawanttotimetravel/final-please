import React from 'react';
import Image from 'next/image';

const Cards = ({ icon, title, description, hasArrow = false }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4">
      <div className="bg-green-100 rounded-full p-2">
        <Image src={icon} alt={title} width={24} height={24} />
      </div>
      <div className="flex-grow">
        <h3 className="text-blue-600 font-semibold text-lg">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
      {hasArrow && (
        <span className="text-gray-400 text-xl">→</span>
      )}
    </div>
  );
};

export default Cards;

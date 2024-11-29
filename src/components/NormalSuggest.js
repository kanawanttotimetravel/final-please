import React from 'react';

const NormalSuggest = ({ suggestion }) => {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
        <p className="text-gray-500 text-lg">{suggestion}</p>
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
};

export default NormalSuggest;

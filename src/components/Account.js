import React from 'react';
import Image from 'next/image';

const AccountHeader = () => {
  return (
    <header className="bg-white border-b-[1px] border-[#03B473]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-3">
          <div className="flex items-center space-x-2">
            <Image 
              src="/ava.png" 
              alt="Avatar" 
              width={32} 
              height={32} 
            />
            <span className="text-[#262CD9] font-bold">WATER</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AccountHeader;

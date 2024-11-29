import React, { useState } from 'react';

const SwitchButton = ({ isCollapsed }) => {
  const [activeTab, setActiveTab] = useState('Main');

  if (isCollapsed) {
    return (
      <div className="inline-flex flex-col rounded-full bg-blue-600 p-1">
        <button
          className={`flex items-center justify-center p-2 rounded-full transition-colors duration-200 ${
            activeTab === 'Database'
              ? 'text-blue-600 bg-white'
              : 'text-white'
          }`}
          onClick={() => setActiveTab('Database')}
          title="Database"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        </button>
        <button
          className={`flex items-center justify-center p-2 rounded-full transition-colors duration-200 ${
            activeTab === 'Main'
              ? 'text-blue-600 bg-white'
              : 'text-white'
          }`}
          onClick={() => setActiveTab('Main')}
          title="Main"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex rounded-full bg-blue-600 p-1">
      <button
        className={`flex items-center px-4 py-2 rounded-full transition-colors duration-200 ${
          activeTab === 'Database'
            ? 'text-blue-600 bg-white hover:text-black'
            : 'text-white hover:text-black'
        }`}
        onClick={() => setActiveTab('Database')}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
        <span className="ml-2">Database</span>
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-full transition-colors duration-200 ${
          activeTab === 'Main'
            ? 'text-blue-600 bg-white hover:text-black'
            : 'text-white hover:text-black'
        }`}
        onClick={() => setActiveTab('Main')}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
        </svg>
        <span className="ml-2">Main</span>
      </button>
    </div>
  );
};

export default SwitchButton;

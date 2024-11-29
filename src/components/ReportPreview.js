import React from 'react';
import Image from 'next/image';

const ReportPreview = ({ machineId, reportDate, pdfData, onDownload }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <Image 
            src="/denso-logo.png" 
            alt="DENSO Logo" 
            width={32} 
            height={32} 
            className="mr-3"
          />
          <div>
            <h3 className="font-bold text-xl text-gray-800">Báo cáo bảo trì</h3>
            <div className="mt-1 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Mã máy:</span>{' '}
                <span className="text-blue-600">{machineId}</span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Ngày tạo:</span>{' '}
                <span>{reportDate}</span>
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
            />
          </svg>
          <span className="font-medium">Tải xuống PDF</span>
        </button>
      </div>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100 to-transparent opacity-50 pointer-events-none rounded-lg" />
        <div className="h-[600px] w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
          <iframe
            src={pdfData}
            className="w-full h-full"
            title="PDF Preview"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
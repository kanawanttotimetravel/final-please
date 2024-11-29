import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import NormalSuggest from './NormalSuggest';
import AccountHeader from './Account';
import ReactMarkdown from 'react-markdown';
import { CSVLink } from "react-csv";
import ReportPreview from './ReportPreview';

const CategoryHeader = ({ icon, title }) => (
  <div className="flex items-center mb-2">
    <Image src={icon} alt={title} width={24} height={24} />
    <h2 className="text-blue-600 font-semibold ml-2">{title}</h2>
  </div>
);

const CodeBlock = ({ children }) => (
  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-2">
    <code>{children}</code>
  </pre>
);

// Add this helper function at the top of the component
const isPdfData = (str) => {
  try {
    return str?.startsWith('data:application/pdf;base64,');
  } catch {
    return false;
  }
};

function Maincontent() {
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isAITyping, setIsAITyping] = useState(false);
  const [csvData, setCsvData] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [isSecureContext, setIsSecureContext] = useState(false);

  const categories = [
    {
      icon: '/sparkles.png',
      title: 'Ví dụ Truy vấn',
      items: [
        'Tạo báo cáo bảo trì cho máy A-123 trong tháng này',
        'Phân tích nguyên nhân và cách khắc phục lỗi E-201 trên máy B-456',
        'Tổng hợp các sự cố thường gặp của dây chuyền sản xuất số 3'
      ]
    },
    {
      icon: '/star.png',
      title: 'Khả năng',
      items: [
        'Tạo báo cáo PDF/CSV về tình trạng máy móc và bảo trì',
        'Phân tích dữ liệu và đề xuất giải pháp tối ưu',
        'Hỗ trợ đa ngôn ngữ (Tiếng Việt, English, 日本語)'
      ]
    },
    {
      icon: '/triangle.png',
      title: 'Lưu ý',
      items: [
        'Cần xác nhận lại thông tin quan trọng trước khi thực hiện',
        'Một số dự đoán có thể cần thêm dữ liệu để chính xác hơn',
        'Luôn tuân thủ quy trình an toàn của nhà máy'
      ]
    }
  ];

  // Update sendChatRequest function
  const sendChatRequest = async (message, imageBase64 = null) => {
    try {
      const response = await fetch('http://112.137.129.253:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          image_base64: imageBase64?.split(',')[1],
          do_rag: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error:', error);
      return 'Sorry, there was an error processing your request.';
    }
  };

  // Update startChat function
  const startChat = async (suggestion) => {
    setIsChatStarted(true);
    setMessages([{ type: 'user', content: suggestion, timestamp: new Date() }]);
    setIsLoading(true);
    setIsAITyping(true);
    
    const response = await sendChatRequest(suggestion);
    setMessages(prev => [...prev, { type: 'ai', content: response, timestamp: new Date() }]);
    setIsLoading(false);
    setIsAITyping(false);
  };

  // Update sendMessage function
  const sendMessage = async (event) => {
    event.preventDefault();
    if (inputMessage.trim() || selectedImage || attachedFile) {
      const newMessage = { 
        type: 'user', 
        content: inputMessage, 
        image: selectedImage,
        file: attachedFile,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      setIsLoading(true);
      setIsAITyping(true);

      try {
        // Send both message and image if available
        const response = await sendChatRequest(inputMessage, selectedImage);
        
        // Process the response
        const processedResponse = processResponse(response);
        
        setMessages(prev => [...prev, { 
          type: 'ai', 
          content: processedResponse, 
          timestamp: new Date() 
        }]);
      } catch (error) {
        console.error('Error processing message:', error);
        setMessages(prev => [...prev, { 
          type: 'ai', 
          content: 'Sorry, there was an error processing your request.', 
          timestamp: new Date() 
        }]);
      } finally {
        setIsLoading(false);
        setIsAITyping(false);
        setSelectedImage(null);
        setAttachedFile(null);
      }
    }
  };

  // Add function to reset chat
  const resetChat = async () => {
    try {
      const response = await fetch('http://112.137.129.253:8000/reset-chat', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsChatStarted(false);
        setMessages([]);
        setSelectedImage(null);
        setAttachedFile(null);
        setPdfData(null);
        setCsvData(null);
      } else {
        console.error('Reset chat failed:', response.status);
      }
    } catch (error) {
      console.error('Error resetting chat:', error);
    }
  };

  // Update handleFileUpload function
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage(reader.result); // This will be the base64 string
        };
        reader.readAsDataURL(file);
      } else {
        setAttachedFile(file);
      }
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
  };

  const formatDate = (date) => {
    const options = { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' };
    return date.toLocaleTimeString('en-US', options);
  };

  // Update handlePDFFromHref function
  const handlePDFFromHref = (content) => {
    try {
      const hrefMatch = content.match(/data:application\/pdf;base64,([^"]+)/);
      if (hrefMatch) {
        const base64Data = hrefMatch[1];
        
        const machineMatch = content.match(/máy\s+([A-Z0-9-]+)/i);
        const machineNumber = machineMatch ? machineMatch[1] : 'Mã máy';
        
        setPdfData({
          base64: base64Data,
          machineId: machineNumber,
          date: new Date().toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        });
        setShowPreview(true);
        
        return `Báo cáo bảo trì cho máy ${machineNumber} đã được tạo thành công. Bạn có thể xem trước hoặc tải xuống bên dưới:`;
      }
    } catch (error) {
      console.error('Error processing PDF from href:', error);
    }
    return content;
  };

  // Add these functions after your existing state declarations
  const handlePDFDownload = (response) => {
    try {
      // Extract the JSON data from the markdown response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const reportData = JSON.parse(jsonMatch[1]);
        
        // Convert base64 to blob
        const byteCharacters = atob(reportData.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = reportData.filename || 'report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error('Error processing PDF download:', error);
    }
  };

  // Update processResponse function
  const processResponse = (content) => {
    // Check if content is a raw base64 string (no prefix)
    if (/^[A-Za-z0-9+/=]+$/.test(content)) {
      // Get machine ID from the last user message
      const lastUserMessage = messages.findLast(m => m.type === 'user')?.content || '';
      const machineMatch = lastUserMessage.match(/máy\s+([A-Z0-9-]+)/i);
      const machineId = machineMatch ? machineMatch[1] : 'Mã máy';
      
      setPdfData({
        base64: content,
        machineId: machineId,
        date: new Date().toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      });
      setShowPreview(true);
      return `Báo cáo bảo trì cho máy ${machineId} đã được tạo thành công. Bạn có thể xem trước hoặc tải xuống bên dưới:`;
    }
    
    // Check for PDF in href format
    if (content.includes('data:application/pdf;base64,')) {
      return handlePDFFromHref(content);
    }
    
    // Check for PDF content in JSON format
    if (content.includes('```json') && content.includes('"type":"pdf"')) {
      handlePDFDownload(content);
      return content.replace(/```json\n[\s\S]*?\n```/, 'PDF report has been generated and downloaded automatically.');
    }
    
    // Check for CSV content
    if (content.startsWith('Xuất báo cáo dưới dạng sau')) {
      try {
        const csvContent = content.split('Xuất báo cáo dưới dạng sau')[1];
        const rows = csvContent.trim().split('\n').map(row => row.split(','));
        setCsvData(rows);
        return content;
      } catch (error) {
        console.error('Error processing CSV data:', error);
        return content;
      }
    }
    
    // Reset CSV data if response doesn't contain CSV
    setCsvData(null);
    return content;
  };

  // Update handleDownloadPDF function
  const handleDownloadPDF = () => {
    if (!pdfData?.base64) return;
    
    try {
      const byteCharacters = atob(pdfData.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { 
        type: 'application/pdf;charset=utf-8' 
      });
      
      const filename = `Bao_cao_bao_tri_${pdfData.machineId}_${new Date().toISOString().split('T')[0]}.pdf`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Có lỗi khi tải xuống PDF. Vui lòng thử lại.');
    }
  };

  // Add function to handle audio recording
  const handleAudioRecording = async () => {
    // Kiểm tra secure context trước
    if (!isSecureContext) {
      alert(`Để sử dụng microphone, bạn cần:
1. Truy cập trang web qua HTTPS
2. Hoặc sử dụng một trong các địa chỉ sau:
   - localhost
   - 127.0.0.1
   - file:///

Vui lòng liên hệ admin để được hỗ trợ cấu hình HTTPS.`);
      return;
    }

    if (!isRecording) {
      try {
        // Kiểm tra xem trình duyệt có hỗ trợ getUserMedia không
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert('Trình duyệt của bạn không hỗ trợ ghi âm. Vui lòng sử dụng Chrome, Firefox hoặc Edge phiên bản mới nhất.');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        });

        setMicrophonePermission('granted');
        
        const recorder = new MediaRecorder(stream);
        
        const audioChunks = [];

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        recorder.onstop = async () => {
          try {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await transcribeAudio(audioBlob);
          } catch (error) {
            console.error('Error processing audio:', error);
            alert('Có lỗi khi xử lý âm thanh. Vui lòng thử lại.');
          } finally {
            stream.getTracks().forEach(track => track.stop());
          }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);

      } catch (error) {
        console.error('Error accessing microphone:', error);
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setMicrophonePermission('denied');
          alert(`Để sử dụng tính năng ghi âm, bạn cần:
1. Đảm bảo trang web được truy cập qua HTTPS
2. Cho phép quyền truy cập microphone:
   - Click vào icon 🔒 hoặc ⓘ bên cạnh địa chỉ web
   - Chọn "Site settings" hoặc "Cài đặt trang web"
   - Tìm mục "Microphone" và chọn "Allow" hoặc "Cho phép"
3. Tải lại trang web sau khi cấp quyền`);
        } else if (error.name === 'NotFoundError') {
          alert('Không tìm thấy thiết bị microphone. Vui lòng kiểm tra kết nối microphone của bạn.');
        } else if (error.name === 'SecurityError') {
          alert('Không thể truy cập microphone do chính sách bảo mật. Vui lòng truy cập qua HTTPS.');
        } else {
          alert('Không thể truy cập microphone. Lỗi: ' + error.message);
        }
      }
    } else {
      try {
        mediaRecorder.stop();
      } finally {
        setIsRecording(false);
        setMediaRecorder(null);
      }
    }
  };

  // Add function to transcribe audio using Whisper API
  const transcribeAudio = async (audioBlob) => {
    setIsProcessingAudio(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');
      formData.append('language', 'vi');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer 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`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      setInputMessage(data.text);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Không thể chuyển đổi giọng nói thành văn bản. Vui lòng thử lại.');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleReportDownload = async (machineId) => {
    try {
      const response = await fetch(`/api/reports/${machineId}`);
      const data = await response.json();
      
      if (data.pdfData) {
        return data.pdfData;
      }
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  };

  // Thêm useEffect để kiểm tra permission khi component mount
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  // Hàm kiểm tra permission
  const checkMicrophonePermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
      setMicrophonePermission(permissionStatus.state);
      
      // Lắng nghe sự thay đổi của permission
      permissionStatus.onchange = () => {
        setMicrophonePermission(permissionStatus.state);
      };
    } catch (error) {
      console.error('Error checking microphone permission:', error);
    }
  };

  // Thêm useEffect để kiểm tra context
  useEffect(() => {
    setIsSecureContext(window.isSecureContext);
  }, []);

  return (
    <main className="flex flex-col h-screen w-screen">
      <div className="flex-shrink-0">
        <AccountHeader />
      </div>
      <Head>
        <title>DENSO - Crafting the Core</title>
      </Head>

      <div className="flex-grow overflow-auto p-8 w-full no-scrollbar">
        {!isChatStarted ? (
          <>
            <header className="mb-8 flex flex-col items-center">
              <img src="/denso-logo.png" alt="DENSO Logo" className="h-[165px]" />
              <p className="text-gray-600 mt-2">Ver 1.0 Sep 22</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <div key={index}>
                  <CategoryHeader icon={category.icon} title={category.title} />
                  {category.items.map((item, itemIndex) => (
                    <div onClick={() => startChat(item)} key={itemIndex}>
                      <NormalSuggest suggestion={item} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full w-full">
            <div className="flex-grow overflow-y-auto mb-4 w-full no-scrollbar">
              {messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left flex items-start'}`}>
                  {message.type === 'ai' && (
                    <Image src="/denso-logo.png" alt="DENSO Logo" width={24} height={24} className="mr-2 mt-1" />
                  )}
                  <div className={`inline-block p-2 rounded-lg ${message.type === 'user' ? 'bg-gray-100 text-gray-700' : 'bg-white'}`}>
                    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} items-center mb-2`}>
                      <span className="text-blue-600 text-xs mr-2">{formatDate(new Date(message.timestamp))}</span>
                    </div>
                    <div className={`text-left ${message.type === 'user' ? '' : 'prose prose-sm max-w-none'}`}>
                      {message.type === 'user' ? (
                        <div>
                          {message.content}
                          {message.image && <img src={message.image} alt="User upload" className="mt-2 max-w-xs" />}
                        </div>
                      ) : (
                        <>
                          <ReactMarkdown components={{ code: CodeBlock }}>
                            {message.content}
                          </ReactMarkdown>
                          {showPreview && pdfData && message.content.includes('đã được tạo thành công') && (
                            <div className="mt-4">
                              <ReportPreview
                                machineId={pdfData.machineId}
                                reportDate={pdfData.date}
                                pdfData={`data:application/pdf;base64,${pdfData.base64}`}
                                onDownload={() => {
                                  handleDownloadPDF();
                                  setShowPreview(false);
                                  setPdfData(null);
                                }}
                              />
                            </div>
                          )}
                        </>
                      )}
                      {message.file && (
                        <div className="flex items-center bg-pink-100 rounded-lg p-2 mt-2">
                          <div className="bg-pink-500 text-white rounded p-2 mr-2">
                            📄
                          </div>
                          <div className="flex-grow">
                            <div className="font-semibold">{message.file.name}</div>
                            <div className="text-xs text-gray-500">{message.file.type}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isAITyping && (
                <div className="flex items-start mb-4">
                  <Image src="/denso-logo.png" alt="DENSO Logo" width={24} height={24} className="mr-2 mt-1" />
                  <div className="inline-block p-2 rounded-lg bg-white">
                    <div className="flex justify-start items-center">
                      <span className="text-blue-600 text-xs mr-2">{formatDate(new Date())}</span>
                    </div>
                    <div className="typing-animation">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t w-full">
        <div className="max-w-[800px] mx-auto p-6">
          {attachedFile && (
            <div className="flex items-center bg-pink-100 rounded-lg p-2 mb-2">
              <div className="bg-pink-500 text-white rounded p-2 mr-2">
                📄
              </div>
              <div className="flex-grow">
                <div className="font-semibold">{attachedFile.name}</div>
                <div className="text-xs text-gray-500">{attachedFile.type}</div>
              </div>
              <button onClick={removeAttachedFile} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
          )}
          {selectedImage && (
            <div className="flex justify-start mb-2">
              <img src={selectedImage} alt="Selected" className="h-[110px] object-contain" />
            </div>
          )}
          <div className="flex justify-end mb-2 space-x-2">
            <button 
              className="flex items-center space-x-2 text-blue-600 px-3 py-1 rounded-full font-semibold text-sm"
              onClick={resetChat}
            >
              <Image src="/Frame 154.png" width={118} height={24} alt="New dialog" />	
            </button>
            {csvData && (
              <CSVLink
                data={csvData}
                filename="report.csv"
                className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded-full font-semibold text-sm hover:bg-green-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Tải xuống CSV</span>
              </CSVLink>
            )}
          </div>
          <form onSubmit={(event) => { sendMessage(event); setIsChatStarted(true); }} 
            className="flex items-center bg-white rounded-xl px-4 py-3 w-full shadow-lg border border-gray-200">
            <label htmlFor="file-upload" 
              className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
              <Image src="/attachment-01.png" alt="Attachment" width={20} height={20} />
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </label>
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn hoặc nhấn mic đ nói..." 
              className="flex-grow mx-3 outline-none text-sm"
            />
            <div className="flex items-center space-x-2">
              <button 
                type="button"
                onClick={handleAudioRecording}
                disabled={isProcessingAudio}
                className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all
                  ${isRecording ? 'bg-red-500 animate-pulse' : 'hover:bg-gray-100'}
                  ${isProcessingAudio ? 'bg-blue-100' : ''}
                  ${!isSecureContext || microphonePermission === 'denied' ? 'opacity-50' : ''}`}
              >
                {isProcessingAudio ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    <Image 
                      src="/microphone-01.png" 
                      alt="Microphone" 
                      width={20} 
                      height={20} 
                      className={`transition-transform ${isRecording ? 'scale-110' : ''}`} 
                    />
                    {(!isSecureContext || microphonePermission === 'denied') && (
                      <div className="absolute -top-12 bg-black text-white text-xs p-2 rounded whitespace-nowrap">
                        {!isSecureContext ? 'Yêu cầu HTTPS để sử dụng microphone' : 'Click để cấp quyền microphone'}
                      </div>
                    )}
                  </>
                )}
                {isRecording && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Image 
                  src="/telegram-fill.png" 
                  alt="Send" 
                  width={20} 
                  height={20} 
                  className={`transition-transform hover:scale-110 ${isLoading ? 'opacity-50' : ''}`} 
                />
              </button>
            </div>
          </form>
        </div>
      </div> 
    </main>
  )
}

export default Maincontent;
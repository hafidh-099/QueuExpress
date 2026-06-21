import React, { useState, useEffect } from 'react';
import { FaQrcode, FaDownload, FaPrint, FaCopy, FaShare, FaCheck, FaEdit, FaLink } from 'react-icons/fa';

const QRManagement = () => {
  const [qrValue, setQrValue] = useState('');
  const [joinLink, setJoinLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [serverIp, setServerIp] = useState('');
  const [isEditingIp, setIsEditingIp] = useState(false);

  // Load saved IP from localStorage on mount
  useEffect(() => {
    const savedIp = localStorage.getItem('queuexpress_server_ip');
    if (savedIp) {
      setServerIp(savedIp);
    } else {
      // Default to localhost if no saved IP
      setServerIp('localhost');
    }
  }, []);

  // Save IP to localStorage when changed
  const saveServerIp = (ip) => {
    setServerIp(ip);
    localStorage.setItem('queuexpress_server_ip', ip);
    setIsEditingIp(false);
  };

  // Get the frontend URL based on server IP
  const getFrontendUrl = () => {
    if (serverIp && serverIp !== 'localhost') {
      return `http://${serverIp}:5174`;
    }
    return 'http://localhost:5174';
  };

  const JOIN_PAGE_URL = `${getFrontendUrl()}/join`;

  const handleGenerateQR = () => {
    setJoinLink(JOIN_PAGE_URL);
    setQrValue(JOIN_PAGE_URL);
  };

  // Generate QR code URL using Google Charts API
  const getQrCodeUrl = () => {
    if (!qrValue) return '';
    const size = 300;
    return `https://quickchart.io/qr?text=${encodeURIComponent(qrValue)}&size=${size}&dark=0099CC&light=FFFFFF`;
  };

  const handleDownloadQR = async () => {
    if (!qrValue) {
      alert('Please generate QR code first');
      return;
    }
    
    setIsDownloading(true);
    try {
      const qrUrl = getQrCodeUrl();
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `queuexpress_qrcode_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download QR code. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintQR = () => {
    if (!qrValue) {
      alert('Please generate QR code first');
      return;
    }
    
    const qrImageUrl = getQrCodeUrl();
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QueueXpress QR Code Poster</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: white;
          }
          .poster {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
            border: 3px solid #0099CC;
            border-radius: 20px;
            padding: 40px;
          }
          h1 {
            color: #0099CC;
            font-size: 36px;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #666;
            font-size: 20px;
            margin-bottom: 30px;
          }
          .qr-container {
            margin: 30px 0;
            display: flex;
            justify-content: center;
          }
          .qr-container img {
            width: 300px;
            height: 300px;
          }
          .url-container {
            margin: 10px 0 20px 0;
            padding: 10px;
            background: #f0f8ff;
            border-radius: 8px;
            display: inline-block;
          }
          .url-text {
            font-family: monospace;
            font-size: 14px;
            color: #0099CC;
            word-break: break-all;
          }
          .instructions {
            text-align: left;
            background: #f5f5f5;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
          }
          .instructions h3 {
            color: #0099CC;
            margin-top: 0;
          }
          .instructions ol {
            margin: 10px 0;
            padding-left: 20px;
          }
          .instructions li {
            margin: 10px 0;
            color: #333;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #999;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .poster {
              border: none;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="poster">
          <h1>QueueXpress</h1>
          <h2>Join Queue Digitally</h2>
          <p class="subtitle">Scan to get your queue number</p>
          <div class="qr-container">
            <img src="${qrImageUrl}" alt="QR Code" />
          </div>
          <div class="url-container">
            <span class="url-text">${qrValue}</span>
          </div>
          <div class="instructions">
            <h3>How to join the queue:</h3>
            <ol>
              <li>Scan this QR code with your phone camera</li>
              <li>Or visit the URL above on any device</li>
              <li>Enter your phone number</li>
              <li>Select a service type</li>
              <li>Get your queue number instantly</li>
              <li>Wait for your turn to be called</li>
            </ol>
          </div>
          <div class="footer">
            <p>QueueXpress Queue Management System | Smart & Efficient</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCopyLink = async () => {
    if (!joinLink) {
      alert('Please generate QR code first');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (!joinLink) {
      alert('Please generate QR code first');
      return;
    }
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QueueXpress',
          text: 'Join the queue digitally',
          url: joinLink,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const getCurrentIPDisplay = () => {
    if (serverIp === 'localhost') {
      return 'localhost (development)';
    }
    return serverIp;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-dark">QR Code Management</h2>
        <p className="text-gray-500 mt-1">Generate and manage QR codes for customer queue joining</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Generator Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
            <FaQrcode className="text-primary" />
            QR Code Generator
          </h3>
          
          <div className="space-y-4">
            {/* Server IP Configuration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Server IP Address
              </label>
              <div className="flex gap-2">
                {isEditingIp ? (
                  <>
                    <input
                      type="text"
                      value={serverIp}
                      onChange={(e) => setServerIp(e.target.value)}
                      placeholder="Enter IP or 'localhost'"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={() => saveServerIp(serverIp)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingIp(false);
                        setServerIp(localStorage.getItem('queuexpress_server_ip') || 'localhost');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono">
                      {getCurrentIPDisplay()}
                    </div>
                    <button
                      onClick={() => setIsEditingIp(true)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                      <FaEdit size={14} />
                      Change
                    </button>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {serverIp === 'localhost' 
                  ? 'Using localhost (only works on this machine)' 
                  : `Using IP: ${serverIp} (accessible on network)`}
              </p>
            </div>

            {/* Join Page URL Display */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Join Page URL
              </label>
              <input
                type="text"
                value={JOIN_PAGE_URL}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Customers will be directed to this page to join the queue
              </p>
            </div>

            <button
              onClick={handleGenerateQR}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition-all font-semibold"
            >
              Generate QR Code
            </button>
          </div>
        </div>

        {/* QR Code Display Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
            <FaQrcode className="text-primary" />
            QR Code Preview
          </h3>
          
          {qrValue ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-200">
                  <img
                    src={getQrCodeUrl()}
                    alt="QR Code"
                    className="w-64 h-64"
                  />
                </div>
              </div>

              {/* URL Display Below QR Code - NEW */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FaLink className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-xs font-mono text-blue-600 dark:text-blue-400 truncate">
                      {qrValue}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="flex-shrink-0 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
                    {copied ? 'Copied!' : 'Copy URL'}
                  </button>
                </div>
               
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadQR}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  <FaDownload /> {isDownloading ? 'Downloading...' : 'Download PNG'}
                </button>
                <button
                  onClick={handlePrintQR}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <FaPrint /> Print Poster
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <FaShare /> Share
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-green-700 dark:text-green-400 text-sm text-center">
                  ✓ QR Code is active and ready to use
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 break-all">
                  URL: {qrValue}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <FaQrcode className="text-4xl text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-400 dark:text-gray-500">Click "Generate QR Code" to create</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">QR code for customer queue joining</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions Card */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-dark dark:text-gray-200 mb-3">How to Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
              1
            </div>
            <p className="font-medium text-dark dark:text-gray-200">Configure IP</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter your server IP address</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
              2
            </div>
            <p className="font-medium text-dark dark:text-gray-200">Generate QR</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create QR code for queue joining page</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
              3
            </div>
            <p className="font-medium text-dark dark:text-gray-200">Download & Print</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Save PNG or print poster for display</p>
          </div>
        </div>
      </div>

      {/* Printable Poster Preview */}
      {qrValue && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-dark dark:text-gray-200 mb-4 flex items-center gap-2">
            <FaPrint className="text-primary" />
            Printable Poster Preview
          </h3>
          
          <div className="border-2 border-primary rounded-2xl p-8 text-center max-w-2xl mx-auto dark:bg-gray-900">
            <h1 className="text-3xl font-bold text-primary mb-2">QueueXpress</h1>
            <h2 className="text-xl font-semibold text-dark dark:text-gray-200 mb-2">Join Queue Digitally</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Scan to get your queue number</p>
            
            <div className="flex justify-center mb-6">
              <img
                src={getQrCodeUrl()}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>

            {/* URL on poster preview */}
            <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg inline-block">
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                {qrValue}
              </span>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-dark dark:text-gray-200 mb-2">How to join the queue:</h3>
              <ol className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>1. Scan this QR code with your phone camera</li>
                <li>2. Or visit the URL above on any device</li>
                <li>3. Enter your phone number</li>
                <li>4. Select a service type</li>
                <li>5. Get your queue number instantly</li>
                <li>6. Wait for your turn to be called</li>
              </ol>
            </div>
            
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">QueueXpress Queue Management System</p>
          </div>
          
          <div className="text-center mt-4">
            <button
              onClick={handlePrintQR}
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              <FaPrint /> Print Full Poster
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRManagement;
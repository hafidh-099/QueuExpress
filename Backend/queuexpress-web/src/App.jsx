import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import JoinForm from './components/JoinForm';
import QueueStatus from './components/QueueStatus';
import FeedbackForm from './components/FeedbackForm';
import { saveQueueData, getQueueData, clearQueueData } from './utils/storage';
import './translations/i18n';

// Import your logo
import wordLogo from './assets/word-logo.png';

function App() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('queuexpress-language') || 'en';
  });
  const [queueId, setQueueId] = useState(null);
  const [queueNumber, setQueueNumber] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useEffect(() => {
    const loadQueueData = async () => {
      const data = await getQueueData();
      if (data.queueId) {
        setQueueId(data.queueId);
        setQueueNumber(data.queueNumber);
      }
    };
    loadQueueData();
  }, []);

  const handleJoinSuccess = async (result) => {
    await saveQueueData(result.queue_id, result.queue_number);
    setQueueId(result.queue_id);
    setQueueNumber(result.queue_number);
    setShowFeedback(false);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  const handleFeedbackSuccess = async () => {
    setShowFeedback(false);
    await clearQueueData();
    setQueueId(null);
    setQueueNumber(null);
  };

  const handleFeedbackClick = () => {
    setShowFeedback(true);
  };

  // ============================================================
  // 🔄 HANDLE JOIN AGAIN - CLEAR DATA AND RESET
  // ============================================================
  const handleJoinAgain = () => {
    console.log('🔄 Joining again...');
    
    // Clear queue data from storage
    clearQueueData();
    
    // Reset all state
    setQueueId(null);
    setQueueNumber(null);
    setShowFeedback(false);
    setStatus(null);
    
    // Force re-render to show join form
    // window.location.reload(); // Uncomment if needed
  };

  // No active queue - show join form
  if (!queueId) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
          <Header language={language} setLanguage={setLanguage} />

          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 md:py-8">
            {/* Logo */}
            <div className="text-center mb-8 md:mb-10">
              <img 
                src={wordLogo} 
                alt="QueueXpress" 
                className="h-12 md:h-16 mx-auto object-contain"
              />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 md:p-8 transition-colors duration-300">
              <JoinForm onJoinSuccess={handleJoinSuccess} />
            </div>
          </main>

          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  // Show queue status
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <Header language={language} setLanguage={setLanguage} />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 md:py-8">
          {/* Logo */}
          <div className="text-center mb-8 md:mb-10">
            <img 
              src={wordLogo} 
              alt="QueueXpress" 
              className="h-12 md:h-16 mx-auto object-contain"
            />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 md:p-8 transition-colors duration-300">
            <QueueStatus
              queueId={queueId}
              queueNumber={queueNumber}
              onFeedbackClick={handleFeedbackClick}
              onStatusChange={handleStatusChange}
              onJoinAgain={handleJoinAgain}
            />
            
            {showFeedback && (
              <div className="mt-6 animate-fadeIn">
                <FeedbackForm
                  queueId={queueId}
                  onSuccess={handleFeedbackSuccess}
                />
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
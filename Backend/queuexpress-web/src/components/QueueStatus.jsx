import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaUsers, FaClock, FaLayerGroup, FaQrcode } from "react-icons/fa";
import { getQueueStatus } from "../api/queue";

const QueueStatus = ({
  queueId,
  queueNumber,
  onFeedbackClick,
  onStatusChange,
  onJoinAgain,
}) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousStatus, setPreviousStatus] = useState(null);
  const [isServed, setIsServed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ title: "", body: "" });

  // ============================================================
  // 🔔 SHOW VISUAL POPUP
  // ============================================================
  const showStatusPopup = (title, body) => {
    setPopupMessage({ title, body });
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 8000);
  };

  // ============================================================
  // 🔔 GET MESSAGES KWA LUGHA
  // ============================================================
  const getMessage = (status, queueNum) => {
    const lang = localStorage.getItem("queuexpress-language") || "en";

    const msgs = {
      en: {
        called: {
          title: "🎯 Your Turn is Here!",
          body: `Queue #${queueNum} has been called. Please proceed to the service counter.`,
        },
        served: {
          title: "✅ Service Completed!",
          body: "Thank you for using QueueXpress. Please share your feedback.",
        },
        skipped: {
          title: "⚠️ Queue Skipped",
          body: "Your turn was skipped. You can join a new queue if needed.",
        },
      },
      sw: {
        called: {
          title: "🎯 Zamu Yako Imefika!",
          body: `Foleni #${queueNum} imeitwa. Tafadhali enda kwenye kaunta ya huduma.`,
        },
        served: {
          title: "✅ Huduma Imekamilika!",
          body: "Asante kwa kutumia QueueXpress. Tafadhali toa maoni yako.",
        },
        skipped: {
          title: "⚠️ Foleni Imerekwa",
          body: "Zamu yako ilirukwa. Unaweza kujiunga na foleni mpya ikiwa inahitajika.",
        },
      },
    };

    return msgs[lang]?.[status] || msgs.en.called;
  };

  // ============================================================
  // 🔔 SEND NOTIFICATION
  // ============================================================
  const sendNotification = (statusType, queueNum) => {
    const msg = getMessage(statusType, queueNum);
    showStatusPopup(msg.title, msg.body);

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const notification = new Notification(msg.title, {
          body: msg.body,
          icon: "/logo192.png",
          requireInteraction: true,
        });
        setTimeout(() => notification.close(), 8000);
      } catch (e) {
        console.log("Browser notification failed:", e);
      }
    }
  };

  // ============================================================
  // FETCH STATUS
  // ============================================================
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getQueueStatus(queueId);
        console.log("📊 Status:", data.status, "Queue:", data.queue_number);
        setStatus(data);

        if (previousStatus && previousStatus !== data.status) {
          console.log(`🔄 Changed: ${previousStatus} -> ${data.status}`);
          sendNotification(data.status, data.queue_number);
        }

        if (data.status === "served" && !isServed) {
          setIsServed(true);
          if (onFeedbackClick) {
            setTimeout(() => onFeedbackClick(), 1500);
          }
        }

        if (onStatusChange) {
          onStatusChange(data.status);
        }

        setPreviousStatus(data.status);
      } catch (err) {
        console.error("❌ Error:", err);
        setError(err.response?.data?.error || "Failed to fetch status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [queueId]);

  // ============================================================
  // REQUEST PERMISSION
  // ============================================================
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting":
        return "text-yellow-500 bg-yellow-500/10";
      case "called":
        return "text-blue-500 bg-blue-500/10";
      case "served":
        return "text-green-500 bg-green-500/10";
      case "skipped":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "waiting":
        return t("status.waiting");
      case "called":
        return t("status.called");
      case "served":
        return t("status.served");
      case "skipped":
        return t("status.skipped");
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0099CC]"></div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {error || "Unable to fetch queue status"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showPopup && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-xl shadow-2xl animate-bounce-in">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-bold text-lg">{popupMessage.title}</h4>
              <p className="text-sm opacity-90">{popupMessage.body}</p>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Queue Card */}
      <div
        className={`rounded-2xl p-6 border-2 ${getStatusColor(status.status)} bg-white dark:bg-gray-900 shadow-lg transition-colors duration-300`}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Queue Info
          </span>
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(status.status)}`}
          >
            {getStatusText(status.status)}
          </span>
        </div>

        <div className="text-center py-4">
          <span className="text-7xl font-extrabold text-[#0099CC] dark:text-[#0099CC]">
            #{status.queue_number}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
          <FaUsers className="text-[#F59E0B]" />
          <span className="font-medium">
            {status.people_ahead} {t("status.peopleAhead")}
          </span>
          {status.people_ahead === 0 && status.status === "waiting" && (
            <span className="text-sm text-green-500 font-medium ml-2">
              {t("status.youAreNext")}
            </span>
          )}
          {status.people_ahead > 0 && (
            <span className="text-sm text-gray-400 ml-2">
              ({status.people_ahead} {t("status.peopleBeforeYou")})
            </span>
          )}
        </div>

        <hr className="my-4 border-gray-200 dark:border-gray-800" />

        <div className="flex justify-around">
          <div className="text-center">
            <FaClock className="text-[#0099CC] text-xl mx-auto mb-1" />
            <span className="text-xs text-gray-500 dark:text-gray-400 block">
              {t("status.estimatedTime")}
            </span>
            <span className="text-lg font-bold text-[#0099CC]">
              {status.estimated_time} {t("status.minutes")}
            </span>
          </div>
          <div className="text-center">
            <FaLayerGroup className="text-[#0099CC] text-xl mx-auto mb-1" />
            <span className="text-xs text-gray-500 dark:text-gray-400 block">
              {t("status.batchNumber")}
            </span>
            <span className="text-lg font-bold text-[#0099CC]">
              {status.batch_number || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* SERVED */}
      {status.status === "served" && (
        <div className="space-y-3">
          <button
            onClick={onFeedbackClick}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-semibold rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02]"
          >
            {t("status.feedbackButton")}
          </button>
          <button
            onClick={onJoinAgain}
            className="w-full py-3 px-4 border-2 border-[#0099CC] text-[#0099CC] font-semibold rounded-xl hover:bg-[#0099CC] hover:text-white transition-all"
          >
            {t("status.joinAgainButton")}
          </button>
        </div>
      )}

      {/* SKIPPED */}
      {status.status === "skipped" && (
        <div className="text-center p-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-300 dark:border-red-700 rounded-xl shadow-lg">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
              {t("status.queueSkipped")}
            </h3>
          </div>
          <p className="text-red-600 dark:text-red-300 text-lg mb-6">
            {t("status.skippedMessage")}
          </p>
          <button
            onClick={onJoinAgain}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#0099CC] text-white font-semibold text-lg rounded-xl hover:bg-[#0077A3] transition-all transform hover:scale-105 shadow-lg"
          >
            <FaQrcode className="text-2xl" />
            {t("status.joinNewQueue")}
          </button>
        </div>
      )}

      {/* CALLED */}
      {status.status === "called" && (
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            {t("status.calledMessage")}
          </p>
        </div>
      )}
    </div>
  );
};

export default QueueStatus;

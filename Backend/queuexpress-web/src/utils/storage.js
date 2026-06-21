// Simple localStorage utilities for web
const QUEUE_ID_KEY = 'queuexpress_queue_id';
const QUEUE_NUMBER_KEY = 'queuexpress_queue_number';

export const saveQueueData = async (queueId, queueNumber) => {
  localStorage.setItem(QUEUE_ID_KEY, queueId.toString());
  localStorage.setItem(QUEUE_NUMBER_KEY, queueNumber.toString());
};

export const getQueueData = async () => {
  const queueId = localStorage.getItem(QUEUE_ID_KEY);
  const queueNumber = localStorage.getItem(QUEUE_NUMBER_KEY);
  return {
    queueId: queueId ? parseInt(queueId) : null,
    queueNumber: queueNumber ? parseInt(queueNumber) : null,
  };
};

export const clearQueueData = async () => {
  localStorage.removeItem(QUEUE_ID_KEY);
  localStorage.removeItem(QUEUE_NUMBER_KEY);
};
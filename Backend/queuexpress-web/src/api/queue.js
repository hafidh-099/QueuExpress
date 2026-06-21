import api from './client';

// Get services (public)
export const getServices = async () => {
  const response = await api.get('/public/services/');
  return response.data;
};

// Join queue
export const joinQueue = async (phoneNumber, serviceId) => {
  const response = await api.post('/join/', {
    phone_number: phoneNumber,
    service_id: serviceId,
  });
  return response.data;
};

// Get queue status
export const getQueueStatus = async (queueId) => {
  const response = await api.get(`/queue/status/${queueId}/`);
  return response.data;
};

// Submit feedback
export const submitFeedback = async (queueId, rating, message) => {
  const response = await api.post('/feedback/', {
    queue_id: queueId,
    rating: rating,
    message: message,
  });
  return response.data;
};
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const uploadFile = async (formData, token) => {
  const response = await axios.post(`${API_URL}/files/upload`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
};

export const deleteFile = async (fileId, token) => {
  const response = await axios.delete(`${API_URL}/files/delete/${fileId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

export const generateLink = async (fileKey, token) => {
  const response = await axios.get(`${API_URL}/files/generate-link/${fileKey}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

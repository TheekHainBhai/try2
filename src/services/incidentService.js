import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

// Get all incidents
const getAllIncidents = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    console.log('API URL:', `${API_URL}/incidents`);
    
    const response = await axios.get(`${API_URL}/incidents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching incidents:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error.response?.data || error;
  }
};

// Get recent incidents
const getRecentIncidents = async () => {
  try {
    const response = await axios.get(`${API_URL}/incidents/recent`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent incidents:', error);
    throw error.response?.data || error;
  }
};

// Update incident status
const updateIncidentStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${API_URL}/incidents/${id}`, { status }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating incident:', error);
    throw error.response?.data || error;
  }
};

export { getAllIncidents, getRecentIncidents, updateIncidentStatus };

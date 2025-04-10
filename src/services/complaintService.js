import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

// Create form data with files
const createFormData = (complaintData) => {
  const formData = new FormData();
  
  // Add all text fields
  Object.keys(complaintData).forEach(key => {
    if (key !== 'evidenceFiles') {
      formData.append(key, complaintData[key]);
    }
  });

  // Add files
  if (complaintData.evidenceFiles) {
    Array.from(complaintData.evidenceFiles).forEach(file => {
      formData.append('evidenceFiles', file);
    });
  }

  return formData;
};

// Submit a new complaint
const submitComplaint = async (complaintData) => {
  try {
    console.log('Submitting complaint with data:', complaintData);
    const formData = createFormData(complaintData);
    
    // Log form data contents
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    const token = localStorage.getItem('token');
    console.log('Using token:', token ? 'Token exists' : 'No token');
    
    const response = await axios.post(`${API_URL}/complaints`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Complaint submission response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting complaint:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error.response?.data || error;
  }
};

// Get all complaints for the current user
const getUserComplaints = async () => {
  try {
    const response = await axios.get(`${API_URL}/complaints/my-complaints`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching complaints:', error);
    throw error.response?.data || error;
  }
};

// Get a specific complaint
const getComplaint = async (complaintId) => {
  try {
    const response = await axios.get(`${API_URL}/complaints/${complaintId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching complaint:', error);
    throw error.response?.data || error;
  }
};

export { submitComplaint, getUserComplaints, getComplaint };

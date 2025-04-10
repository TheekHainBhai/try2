import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const FSSAIVerification = () => {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState('verification');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [business, setBusiness] = useState('');
  const [email, setEmail] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (user) {
      // Set email from user context
      setEmail(user.email);
      // Ensure business is empty
      setBusiness('');
    }
  }, [user]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validateFSSAINumber = (number) => {
    // Validate FSSAI number: exactly 14 digits
    return /^\d{14}$/.test(number);
  };

  const compareWithCollection = async (number) => {
    try {
      // Convert to string and trim
      const fssaiNumber = number.toString().trim();
      
      console.log('Comparing FSSAI Number:', fssaiNumber);
      const response = await axios.get('http://localhost:5002/api/fssai/check', {
        params: { fssaiNumber: fssaiNumber }
      });
      
      console.log('Check Response:', response.data);
      
      // Log detailed matching information
      if (response.data.matchedRegistrations) {
        console.log('Matched Registrations:', response.data.matchedRegistrations);
      }
      
      // Return the result of the check
      return response.data.exists;
    } catch (error) {
      console.error('Error comparing FSSAI number:', error.response ? error.response.data : error.message);
      return false;
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setMessage('');
    setError('');

    // Validate FSSAI number
    if (!fssaiNumber || !validateFSSAINumber(fssaiNumber)) {
      setError('Invalid FSSAI number. Must be exactly 14 digits.');
      setIsVerifying(false);
      return;
    }

    try {
      console.log('Starting FSSAI verification for number:', fssaiNumber);
      
      // Compare with collection
      const isInCollection = await compareWithCollection(fssaiNumber);
      
      console.log('Verification result:', isInCollection);
      
      if (isInCollection) {
        setMessage('FSSAI number verified successfully');
      } else {
        setError('FSSAI number does not match any records');
      }
      setIsVerifying(false);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || 'Verification failed');
      setIsVerifying(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    setMessage('');
    setError('');

    // Validate inputs
    if (!business) {
      setError('Business name is required');
      setIsRegistering(false);
      return;
    }

    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      setIsRegistering(false);
      return;
    }

    if (!certificate) {
      setError('FSSAI Certificate is required');
      setIsRegistering(false);
      return;
    }

    const formData = new FormData();
    formData.append('business', business);
    formData.append('email', email);
    formData.append('certificate', certificate);

    try {
      await axios.post('http://localhost:5002/api/fssai/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('Registration successful');
      setBusiness('');
      setEmail('');
      setCertificate(null);
      setIsRegistering(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setIsRegistering(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Validate file type and size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload PDF, JPEG, or PNG.');
        e.target.value = null;
        return;
      }

      if (file.size > maxSize) {
        setError('File size exceeds 5MB limit.');
        e.target.value = null;
        return;
      }

      setCertificate(file);
    }
  };

  const handleServiceChange = (e) => {
    const newService = e.target.value;
    setSelectedService(newService);
    // Reset form
    setFssaiNumber('');
    setBusiness('');
    // Keep email pre-filled if user is logged in
    setEmail(user?.email || '');
    setCertificate(null);
    setMessage('');
    setError('');
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          FSSAI Services
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Select Service</InputLabel>
            <Select
              value={selectedService}
              label="Select Service"
              onChange={handleServiceChange}
            >
              <MenuItem value="verification">Number Verification</MenuItem>
              <MenuItem value="registration">New Registration</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box component="form" onSubmit={selectedService === 'verification' ? handleVerify : handleRegister} sx={{ mt: 2 }}>
          {selectedService === 'verification' ? (
            <TextField
              fullWidth
              label="FSSAI Number"
              value={fssaiNumber}
              onChange={(e) => {
                // Only allow digits and limit to 14 characters
                const sanitizedValue = e.target.value.replace(/\D/g, '').slice(0, 14);
                setFssaiNumber(sanitizedValue);
              }}
              inputProps={{
                maxLength: 14,
                pattern: '\\d{14}'
              }}
              helperText="FSSAI number must be exactly 14 digits"
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
          ) : (
            <Box>
              <TextField
                fullWidth
                label="Business Name"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                margin="normal"
                required
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                sx={{ mb: 2 }}
              />
              
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ mb: 2 }}
              >
                Upload FSSAI Certificate
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </Button>

              {certificate && (
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Selected File: {certificate.name}
                </Typography>
              )}
            </Box>
          )}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={selectedService === 'verification' ? isVerifying : isRegistering}
          >
            {selectedService === 'verification' ? (isVerifying ? 'Verifying...' : 'Verify Number') : (isRegistering ? 'Registering...' : 'Register')}
          </Button>
        </Box>

        {(message || error) && (
          <Box sx={{ mt: 3 }}>
            {message && (
              <Alert severity="success">
                {message}
              </Alert>
            )}
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default FSSAIVerification;

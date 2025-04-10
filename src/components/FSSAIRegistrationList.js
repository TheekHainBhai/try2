import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const FSSAIRegistrationList = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [openFSSAIDialog, setOpenFSSAIDialog] = useState(null);
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchRegistrations = useCallback(async () => {
    // Ensure user is logged in and has an email
    if (!user || !user.email) {
      setError('Please log in to view your registrations');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5002/api/fssai/my-registrations', {
        params: { email: user.email }
      });
      setRegistrations(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setError(error.response?.data?.message || 'Error fetching registrations');
    }
  }, [user]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5002/api/fssai/update-status/${id}`, {
        status: newStatus
      });
      // Refresh the list after updating
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating registration status:', error);
      setError(error.response?.data?.message || 'Error updating registration status');
    }
  };

  const validateFSSAINumber = (number) => {
    // Validate FSSAI number: exactly 14 digits
    return /^\d{14}$/.test(number);
  };

  const handleFSSAISubmit = async () => {
    if (!openFSSAIDialog) return;

    // Validate FSSAI number
    if (!fssaiNumber || !validateFSSAINumber(fssaiNumber)) {
      setError('Invalid FSSAI number. Must be exactly 14 digits.');
      return;
    }

    try {
      const response = await axios.patch(`http://localhost:5002/api/fssai/update-fssai/${openFSSAIDialog}`, {
        fssaiNumber
      });
      
      // Show success message
      setMessage(response.data.message);
      
      // Close dialog and reset
      setOpenFSSAIDialog(null);
      setFssaiNumber('');
      
      // Refresh registrations
      fetchRegistrations();
    } catch (error) {
      console.error('Error submitting FSSAI number:', error);
      setError(error.response?.data?.message || 'Error submitting FSSAI number');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My FSSAI Registrations
      </Typography>
      
      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      {message && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="success">{message}</Alert>
        </Box>
      )}

      {!user && (
        <Alert severity="warning">
          Please log in to view your FSSAI registrations
        </Alert>
      )}

      {user && registrations.length === 0 && !error && (
        <Alert severity="info">
          You have no FSSAI registrations
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>FSSAI Number</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.map((reg) => (
              <TableRow key={reg._id}>
                <TableCell>{reg.business}</TableCell>
                <TableCell>
                  {new Date(reg.registrationDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={reg.status}
                      onChange={(e) => handleStatusChange(reg._id, e.target.value)}
                      renderValue={(selected) => (
                        <Chip 
                          label={selected} 
                          color={getStatusColor(selected)} 
                          variant="outlined" 
                        />
                      )}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Approved">Approved</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  {reg.fssaiNumber || 'Not Added'}
                </TableCell>
                <TableCell>
                  {reg.status === 'Approved' && !reg.fssaiNumber && (
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => setOpenFSSAIDialog(reg._id)}
                    >
                      Add FSSAI Number
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* FSSAI Number Dialog */}
      <Dialog 
        open={!!openFSSAIDialog} 
        onClose={() => setOpenFSSAIDialog(null)}
      >
        <DialogTitle>Enter FSSAI Number</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="FSSAI Number"
            fullWidth
            variant="outlined"
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFSSAIDialog(null)} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleFSSAISubmit} 
            color="primary"
            disabled={!validateFSSAINumber(fssaiNumber)}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FSSAIRegistrationList;

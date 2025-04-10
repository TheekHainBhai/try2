import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { getAllIncidents, updateIncidentStatus } from '../services/incidentService';

const IncidentTracking = () => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      console.log('Fetching incidents...');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        console.error('No token found in localStorage');
        return;
      }
      console.log('Token exists:', !!token);
      const data = await getAllIncidents();
      console.log('Received incidents:', data);
      setIncidents(data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch incidents. Please try again later.');
      console.error('Error fetching incidents:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateIncidentStatus(id, newStatus);
      await fetchIncidents(); // Refresh the list
      setError('');
    } catch (err) {
      setError('Failed to update incident status. Please try again.');
      console.error('Error updating incident:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading incidents...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={fetchIncidents} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Container>
    );
  }

  const incidentsList = incidents.map(incident => ({
    id: incident._id,
    product: incident.product,
    issueType: incident.category,
    status: incident.status,
    dateReported: new Date(incident.createdAt).toLocaleDateString(),
    priority: incident.priority,
    steps: [
      {
        label: 'Complaint Received',
        description: incident.description,
        date: new Date(incident.createdAt).toLocaleDateString(),
        completed: true
      },
      {
        label: 'Under Investigation',
        description: 'Quality team reviewing the complaint',
        date: incident.status === 'Under Investigation' ? new Date().toLocaleDateString() : '',
        completed: incident.status === 'Under Investigation' || incident.status === 'Resolved'
      },
      {
        label: 'Resolution',
        description: 'Issue resolved',
        date: incident.status === 'Resolved' ? new Date().toLocaleDateString() : '',
        completed: incident.status === 'Resolved'
      }
    ]
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Incident Tracking
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Issue Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date Reported</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidentsList.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>{incident.id}</TableCell>
                  <TableCell>{incident.product}</TableCell>
                  <TableCell>{incident.issueType}</TableCell>
                  <TableCell>
                    <Chip
                      label={incident.status}
                      color={
                        incident.status === 'Resolved'
                          ? 'success'
                          : incident.status === 'Under Investigation'
                          ? 'warning'
                          : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>{incident.dateReported}</TableCell>
                  <TableCell>
                    <Chip
                      label={incident.priority}
                      color={
                        incident.priority === 'High'
                          ? 'error'
                          : incident.priority === 'Medium'
                          ? 'warning'
                          : 'info'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedIncident(incident);
                        setOpenDialog(true);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedIncident && (
          <>
            <DialogTitle>
              Incident Details - {selectedIncident.product}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Stepper orientation="vertical">
                  {selectedIncident.steps.map((step, index) => (
                    <Step key={step.label} active={step.completed}>
                      <StepLabel>
                        {step.label}
                        {step.date && ` - ${step.date}`}
                      </StepLabel>
                      <StepContent>
                        <Typography>{step.description}</Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              {selectedIncident.status !== 'Resolved' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    const newStatus =
                      selectedIncident.status === 'Open' ? 'Under Investigation' : 'Resolved';
                    handleStatusUpdate(selectedIncident.id, newStatus);
                    setOpenDialog(false);
                  }}
                >
                  {selectedIncident.status === 'Open' ? 'Start Investigation' : 'Mark as Resolved'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default IncidentTracking;

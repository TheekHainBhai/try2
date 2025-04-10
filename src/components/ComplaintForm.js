import React, { useState } from 'react';
import { submitComplaint } from '../services/complaintService';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';

const steps = ['Product Details', 'Issue Description', 'Evidence & Verification'];

const ComplaintForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    batchNumber: '',
    purchaseDate: '',
    category: '',
    issueType: '',
    description: '',
    evidenceFiles: [],
    fssaiNumber: '',
    agreeToTerms: false,
  });

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.productName && formData.batchNumber && formData.purchaseDate && formData.category;
      case 1:
        return formData.issueType && formData.description && formData.description.length >= 20;
      case 2:
        return formData.agreeToTerms;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      setError('');
    } else {
      setError('Please fill in all required fields correctly');
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(activeStep)) {
      if (formData.description.length < 20) {
        setError('Description must be at least 20 characters long');
      } else {
        setError('Please fill in all required fields correctly');
      }
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await submitComplaint(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setActiveStep(0);
        setFormData({
          productName: '',
          batchNumber: '',
          purchaseDate: '',
          category: '',
          issueType: '',
          description: '',
          evidenceFiles: [],
          fssaiNumber: '',
          agreeToTerms: false,
        });
      }, 3000);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit complaint. Please make sure all fields are filled correctly.');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Product Name"
              value={formData.productName}
              onChange={(e) =>
                setFormData({ ...formData, productName: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Batch Number"
              value={formData.batchNumber}
              onChange={(e) =>
                setFormData({ ...formData, batchNumber: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              type="date"
              label="Purchase Date"
              value={formData.purchaseDate}
              onChange={(e) =>
                setFormData({ ...formData, purchaseDate: e.target.value })
              }
              margin="normal"
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <MenuItem value="Food">Food</MenuItem>
                <MenuItem value="Beverages">Beverages</MenuItem>
                <MenuItem value="Packaged Goods">Packaged Goods</MenuItem>
                <MenuItem value="Dairy">Dairy</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Issue Type</InputLabel>
              <Select
                value={formData.issueType}
                label="Issue Type"
                onChange={(e) =>
                  setFormData({ ...formData, issueType: e.target.value })
                }
              >
                <MenuItem value="Quality Issue">Quality Issue</MenuItem>
                <MenuItem value="Safety Concern">Safety Concern</MenuItem>
                <MenuItem value="Labeling Issue">Labeling Issue</MenuItem>
                <MenuItem value="Packaging Defect">Packaging Defect</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Detailed Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              required
              error={formData.description.length > 0 && formData.description.length < 20}
              helperText={`Minimum 20 characters required. Current length: ${formData.description.length} characters`}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="file"
              inputProps={{
                multiple: true,
                accept: 'image/*,.pdf',
              }}
              onChange={(e) =>
                setFormData({ ...formData, evidenceFiles: e.target.files })
              }
              margin="normal"
              helperText="Upload images or documents as evidence"
            />
            <TextField
              fullWidth
              label="FSSAI License Number (if applicable)"
              value={formData.fssaiNumber}
              onChange={(e) =>
                setFormData({ ...formData, fssaiNumber: e.target.value })
              }
              margin="normal"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreeToTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, agreeToTerms: e.target.checked })
                  }
                  required
                />
              }
              label="I confirm that all the information provided is accurate"
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 10, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          File a Complaint
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Complaint submitted successfully! Thank you for your feedback.
          </Alert>
        )}
        {!error && !success && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Your complaint will be reviewed by our quality assurance team and relevant authorities.
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                type="submit"
                disabled={loading || !formData.agreeToTerms}
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ComplaintForm;

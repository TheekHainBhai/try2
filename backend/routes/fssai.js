const express = require('express');
const router = express.Router();
const multer = require('multer');
const FSSAIReg = require('../models/FSSAIReg');

// Configure multer for file upload
const upload = multer({ 
    dest: 'uploads/fssai_certificates/',
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

// Verify FSSAI Number
router.post('/verify', async (req, res) => {
    try {
        const { fssaiNumber } = req.body;
        
        // Validate FSSAI number
        if (!fssaiNumber || !/^\d{14}$/.test(fssaiNumber)) {
            return res.status(400).json({ 
                message: 'Invalid FSSAI number. Must be exactly 14 digits.' 
            });
        }
        
        // Check if FSSAI number exists in registrations
        const existingRegistration = await FSSAIReg.findOne({ fssaiNumber });
        
        if (existingRegistration) {
            return res.json({ 
                isValid: true, 
                message: 'FSSAI number verified successfully' 
            });
        } else {
            return res.json({ 
                isValid: false, 
                message: 'FSSAI number does not match any records' 
            });
        }
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Error verifying FSSAI number' });
    }
});

// FSSAI Registration
router.post('/register', upload.single('certificate'), async (req, res) => {
    try {
        const { business, email } = req.body;
        const certificate = req.file;

        // Validate input
        if (!business) {
            return res.status(400).json({ message: 'Business name is required' });
        }

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        if (!certificate) {
            return res.status(400).json({ message: 'FSSAI Certificate is required' });
        }

        // Create registration record
        const registration = new FSSAIReg({
            business,
            email,
            certificateFileName: certificate.filename,
            certificatePath: certificate.path
        });

        // Save to database
        await registration.save();

        res.status(201).json({ 
            message: 'Registration successful', 
            data: { 
                business, 
                email,
                certificateFileName: certificate.filename 
            } 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error processing registration' });
    }
});

// Get user's own FSSAI registrations
router.get('/my-registrations', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const registrations = await FSSAIReg.find({ email }).sort({ registrationDate: -1 });

        if (!registrations || registrations.length === 0) {
            return res.status(404).json({ message: 'No FSSAI registrations found' });
        }

        res.json(registrations);
    } catch (error) {
        console.error('Error fetching user registrations:', error);
        res.status(500).json({ message: 'Error fetching registrations' });
    }
});

// Get all registrations
router.get('/registrations', async (req, res) => {
    try {
        const { fssaiNumber } = req.query;
        
        let query = {};
        if (fssaiNumber) {
            query.fssaiNumber = fssaiNumber;
        }
        
        const registrations = await FSSAIReg.find(query).sort({ registrationDate: -1 });
        
        res.json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ message: 'Error fetching registrations' });
    }
});

// Update verification status
router.patch('/update-verification/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { verified } = req.body;

        // Validate input
        if (typeof verified !== 'boolean') {
            return res.status(400).json({ message: 'Invalid verification status' });
        }

        const registration = await FSSAIReg.findByIdAndUpdate(
            id, 
            { verified }, 
            { new: true }
        );

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        res.json(registration);
    } catch (error) {
        console.error('Error updating verification status:', error);
        res.status(500).json({ message: 'Error updating verification status' });
    }
});

// Update registration status
router.patch('/update-status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate input
        const validStatuses = ['Pending', 'Approved', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const registration = await FSSAIReg.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        res.json(registration);
    } catch (error) {
        console.error('Error updating registration status:', error);
        res.status(500).json({ message: 'Error updating registration status' });
    }
});

// Update FSSAI Number route
router.patch('/update-fssai/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fssaiNumber } = req.body;

        // Validate FSSAI number
        if (!fssaiNumber || !/^\d{14}$/.test(fssaiNumber)) {
            return res.status(400).json({ 
                message: 'Invalid FSSAI number. Must be exactly 14 digits.' 
            });
        }

        // Find the registration
        const registration = await FSSAIReg.findById(id);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check if registration status is approved
        if (registration.status !== 'Approved') {
            return res.status(400).json({ 
                message: 'FSSAI number can only be added to Approved registrations' 
            });
        }

        // Update registration with FSSAI number
        registration.fssaiNumber = fssaiNumber;
        registration.verified = true;

        // Save the updated registration
        await registration.save();

        res.json({
            message: 'FSSAI number added successfully',
            registration
        });
    } catch (error) {
        console.error('Error updating FSSAI number:', error);
        res.status(500).json({ message: 'Error updating FSSAI number' });
    }
});

// Check FSSAI Number in collection
router.get('/check', async (req, res) => {
    try {
        const { fssaiNumber } = req.query;
        
        console.log('Received FSSAI Number for check:', fssaiNumber);

        if (!fssaiNumber) {
            return res.status(400).json({ 
                exists: false, 
                message: 'FSSAI number is required' 
            });
        }
        
        // Find all registrations with FSSAI number
        const matchingRegistrations = await FSSAIReg.find({ 
            fssaiNumber: { 
                $regex: `^${fssaiNumber}$`, 
                $options: 'i' 
            }
        });
        
        console.log('Matching Registrations:', matchingRegistrations.length);
        console.log('Matched Registrations Details:', 
            matchingRegistrations.map(reg => ({
                fssaiNumber: reg.fssaiNumber,
                business: reg.business,
                status: reg.status
            }))
        );
        
        res.json({ 
            exists: matchingRegistrations.length > 0,
            message: matchingRegistrations.length > 0
                ? 'FSSAI number found in collection' 
                : 'FSSAI number not found',
            matchCount: matchingRegistrations.length,
            matchedRegistrations: matchingRegistrations
        });
    } catch (error) {
        console.error('Error checking FSSAI number:', error);
        res.status(500).json({ 
            exists: false, 
            message: 'Error checking FSSAI number' 
        });
    }
});

module.exports = router;
const mongoose = require('mongoose');

const fssaiRegSchema = new mongoose.Schema({
    business: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    certificateFileName: {
        type: String,
        required: true
    },
    certificatePath: {
        type: String,
        required: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    verified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    fssaiNumber: {
        type: String,
        trim: true,
        default: null
    }
});

module.exports = mongoose.model('FSSAIReg', fssaiRegSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Logistics Schema
const logisticsSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true,
        minlength: [6, 'Password must be at least 6 characters long']
    },
    phone: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    }
});

// Hash password before saving
logisticsSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Creating the model
const Logistics = mongoose.model('Logistics', logisticsSchema);

module.exports = Logistics;

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Consumer Schema
const consumerSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true, 
        unique: true, 
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'] // Regex for international phone format
    },
    apartment: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true, 
        minlength: [6, 'Password must be at least 6 characters long'] 
    }
});

// Hash password before saving
consumerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); // Only hash if password is modified

    try {
        const salt = await bcrypt.genSalt(10); // Generate salt
        this.password = await bcrypt.hash(this.password, salt); // Hash the password
        next(); // Continue with the save process
    } catch (err) {
        next(err); // Pass any errors to the next middleware
    }
});

// Creating the model
const Consumer = mongoose.model('Consumer', consumerSchema);

module.exports = Consumer;

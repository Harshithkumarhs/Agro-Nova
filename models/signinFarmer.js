const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Farmer Schema
const farmerSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true,
        minlength: [6, 'Password must be at least 6 characters long'] // Minimum password length
    },
});

// Hash password before saving
farmerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); // Only hash if the password is modified

    try {
        const salt = await bcrypt.genSalt(10); // Generate salt
        this.password = await bcrypt.hash(this.password, salt); // Hash the password
        next(); // Continue with the save process
    } catch (err) {
        next(err); // Pass any errors to the next middleware
    }
});

// Creating the model
const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;

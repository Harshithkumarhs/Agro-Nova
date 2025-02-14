const mongoose = require('mongoose');

const totalGrocerySchema = new mongoose.Schema({
  apartmentId: String,
  totalItems: [{
    item: String,
    totalQuantity: Number
  }],
  status: {
    type: String,
    default: 'Pending'
  }
});

const TotalGrocery = mongoose.model('TotalGrocery', totalGrocerySchema);

module.exports = TotalGrocery;

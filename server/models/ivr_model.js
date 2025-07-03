// IVR Menu Schema
const mongoose = require('mongoose');

const ivrMenuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  featureCode: {
    type: String,
    required: true,
    trim: true
  },
  greeting: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    number: {
      type: String,
      required: true,
      trim: true
    },
    queue: {
      type: String,
      required: true,
      trim: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
ivrMenuSchema.index({ name: 1 });
ivrMenuSchema.index({ 'options.number': 1 });

const IVRMenu = mongoose.model('IVRMenu', ivrMenuSchema);

module.exports = IVRMenu;
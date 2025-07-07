// IVR Menu Schema
const mongoose = require('mongoose');

const ivrMenuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  announcement: [{
    type: String,
    required: true,
  }],
  dtmf: {
    timeout: {
      type: Number,
      default: 5
    },
    invalidRetries: {
      type: Number,
      default: 3
    },
    timeoutRetries: {
      type: Number,
      default: 3
    },
    invalidRetryRecording: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AudioRecording'
    }
  },
  entries: [{
    digit: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      trim: true
    }
  }],

});

// Create indexes for better query performance
ivrMenuSchema.index({ name: 1 }); 
ivrMenuSchema.index({ 'entries.digit': 1 });

const IVRMenu = mongoose.model('IVRMenu', ivrMenuSchema);

module.exports = IVRMenu;
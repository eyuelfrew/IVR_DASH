const express = require('express');
const router = express.Router();


const ivrRoutes = require('./ivrRoutes');
const recordingRoutes = require('./recordingRoutes');
router.use('/ivr', ivrRoutes);
router.use('/audio', recordingRoutes);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

module.exports = router;

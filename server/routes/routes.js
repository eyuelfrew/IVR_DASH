const express = require('express');
const router = express.Router();
const ivrController = require('../controllers/ivr_controller');
const { createMenu, checkFeatureCode, checkFeatureCodeFromForm } = require('../controllers/createMenu');
const uploadAudio = require('../controllers/audio-controllers/uploadAudio');
const { getRecordings, getRecordingById } = require('../controllers/audio-controllers/getRecordings');

// Basic route
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to IVR API'
  });
});

// Audio Upload Route
router.post('/audio/upload', uploadAudio);

// Audio retrieval routes
router.get('/audio/recordings', getRecordings);
router.get('/audio/recordings/:id', getRecordingById);

// IVR Menu Routes
// Create a new IVR menu
router.post('/ivr/create', createMenu);

// Get all IVR menus
router.get('/menus', ivrController.getAllMenus);

// Get a single IVR menu by ID
router.get('/ivr/menus/:id', ivrController.getMenuById);

// Update an IVR menu
router.put('/ivr/menus/:id', ivrController.updateMenu);

// Delete an IVR menu
router.delete('/menus/:id', ivrController.deleteMenu);

router.get('/ivr/check-feature-code/:featureCode', checkFeatureCodeFromForm);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

module.exports = router;

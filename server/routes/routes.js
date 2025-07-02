const express = require('express');
const router = express.Router();
const ivrController = require('../controllers/ivr_controller');

// Basic route
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to IVR API'
  });
});




// IVR Menu Routes
// Create a new IVR menu
router.post('/menus', ivrController.createMenu);

// Get all IVR menus
router.get('/menus', ivrController.getAllMenus);

// Get a single IVR menu by ID
router.get('/menus/:id', ivrController.getMenuById);

// Update an IVR menu
router.put('/menus/:id', ivrController.updateMenu);

// Delete an IVR menu
router.delete('/menus/:id', ivrController.deleteMenu);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

module.exports = router;

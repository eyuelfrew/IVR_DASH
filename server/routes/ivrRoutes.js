const express = require("express");
const { createIVRMenu } = require("../controllers/ivrControllers/createIVRMenu");
const { getAllMenus, deleteMenu } = require("../controllers/ivr_controller");
const ivrRoutes = express.Router()

// Create IVR Menus 

ivrRoutes.post('/menu', createIVRMenu)

// Get IVR Menus

ivrRoutes.get('/menu', getAllMenus)  

// Delete IVR Menu

ivrRoutes.delete('/menu/:id', deleteMenu)




module.exports = ivrRoutes;

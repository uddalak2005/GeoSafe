// src/routes/locationRoutes.js
import express from "express";
import locationController from "../controllers/location.controller.js";
const router = express.Router();

// Worker updates location
router.post("/", locationController.updateLocation);

// Get latest worker location
router.get("/:id", locationController.getLocation);

export default router;
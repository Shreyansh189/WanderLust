const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const multer  = require('multer')
const{storage}=require("../cloudConfig.js")
const upload = multer({ storage });// to upload images

const Listing = require('../models/listing');
const { isLoggedIn, isOwner,validateListing } = require("../middleware.js");
const listingController=require("../controllers/listings.js");

// MOVE SPECIFIC ROUTES BEFORE DYNAMIC ROUTES
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Add the update-location route BEFORE the /:id routes
router.post("/:id/update-location", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { coordinates } = req.body;
    
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        return res.status(400).json({ error: 'Invalid coordinates provided' });
    }
    
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
    }
    
    // Update coordinates
    listing.geometry = {
        type: 'Point',
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
    };
    
    await listing.save();
    
    res.json({ 
        success: true, 
        message: 'Location updated successfully',
        coordinates: listing.geometry.coordinates 
    });
}));

// Combined routes for root path
router.route("/")
  .get(isLoggedIn, wrapAsync(listingController.index))
  .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));

// Edit route - BEFORE the dynamic /:id route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

// Dynamic /:id routes
router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, upload.single('listing[image]'), validateListing, isOwner, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;

const Listing = require("../models/listing");

// Geocoding function to get coordinates from location
const geocodeLocation = async (location) => {
    try {
        // Using OpenStreetMap Nominatim API (free, no API key required)
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            return [lon, lat]; // GeoJSON format: [longitude, latitude]
        }
        return [77.2090, 28.6139]; // Default to Delhi, India
    } catch (error) {
        console.error('Geocoding error:', error);
        return [77.2090, 28.6139]; // Default coordinates
    }
};

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({}).populate("owner");
    res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs")
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exists!");
        res.redirect("/listings");
        return;
    }

    res.render("listings/show.ejs", { listing });
};
module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;

    console.log(url, "..", filename);
    console.log("Form data received:", req.body); // Debug log
    
    // Create listing without the coordinate fields first
    const listingData = { ...req.body.listing };
    
    // Remove any coordinate-related fields that might cause validation errors
    delete listingData.coordinates;
    delete listingData.geometry;
    
    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    
    // Handle coordinates from map selection (using the separate fields approach)
    if (req.body.selectedLng && req.body.selectedLat && 
        req.body.selectedLng !== '' && req.body.selectedLat !== '' &&
        req.body.selectedLng !== '0' && req.body.selectedLat !== '0') {
        
        console.log('✅ Using coordinates from map selection:', [req.body.selectedLng, req.body.selectedLat]);
        
        // Set geometry AFTER creating the listing object
        newListing.geometry = {
            type: 'Point',
            coordinates: [parseFloat(req.body.selectedLng), parseFloat(req.body.selectedLat)]
        };
    }
    // Fallback to geocoding if no coordinates selected
    else if (req.body.listing.location) {
        console.log('⚡ Using geocoding for:', req.body.listing.location);
        const coordinates = await geocodeLocation(`${req.body.listing.location}, ${req.body.listing.country}`);
        newListing.geometry = {
            type: 'Point',
            coordinates: coordinates
        };
    }
    
    console.log("Final listing geometry:", newListing.geometry); // Debug log
    
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};
    

module.exports.editListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    
    // Update the basic listing information
    listing.set({ ...req.body.listing });
    
    // Update the image if a new one is uploaded
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    
    // UPDATE COORDINATES IF LOCATION CHANGED
    if (req.body.listing.location) {
        const coordinates = await geocodeLocation(`${req.body.listing.location}, ${req.body.listing.country}`);
        listing.geometry = {
            type: 'Point',
            coordinates: coordinates
        };
    }
    
    // Save the updated listing
    await listing.save();
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect('/listings');
};

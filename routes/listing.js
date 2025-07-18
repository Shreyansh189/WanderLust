const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require('../models/listing');
const { isLoggedIn, isOwner,validateListing } = require("../middleware.js");


//index
router.get("/", isLoggedIn, wrapAsync(async (req, res) => {
    const allListings = await Listing.find({}).populate("owner");
    res.render("listings/index", { allListings });
}));

//new route to submit new listings
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs")
})

// show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if (!listing) {
        req.flash("error", "Listing you  requested for does not exists!");
        res.redirect("/listings");
        return;
    }
    res.render("listings/show.ejs", { listing });
}));

//create route 
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

//update route
router.put('/:id', isLoggedIn, validateListing, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing update!");
    res.redirect(`/listings/${id}`);
}));

//delete route
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "listing deleted!");
    res.redirect('/listings');
}));

module.exports = router;
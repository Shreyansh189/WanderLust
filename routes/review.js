const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js")
const {listingSchema,reviewSchema}=require("../schema.js");
const Review =require("../models/review.js")
const Listing = require('../models/listing');
const{validateReview}=require("../middleware.js")



//reviews routes
router.post("/", validateReview, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","new review added");
    console.log("New review added");
    res.redirect(`/listings/${listing._id}`); // redirect to the listing's show page
}));

//delete reviews route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review deleted");
    res.redirect(`/listings/${id}`);
}));

module.exports=router;

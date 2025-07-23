const Listing=require("../models/listing")
const Review = require("../models/review");


module.exports.postReview=async (req, res) => {
   let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; // Add the user reference
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`); // redirect to the listing's show page
};

module.exports.deleteReview=async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "review deleted");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteAllReviews = async (req, res) => {
    const { id } = req.params;
    // Find the listing and clear its reviews array
    await Listing.findByIdAndUpdate(id, { $set: { reviews: [] } });
    // Delete all reviews associated with this listing
    await Review.deleteMany({ _id: { $in: (await Listing.findById(id)).reviews } });
    req.flash("success", "All reviews have been deleted!");
    res.redirect(`/listings/${id}`);
};
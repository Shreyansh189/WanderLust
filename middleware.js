const Listing = require("./models/listing");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirect = req.originalUrl;
        req.flash("error", "You must be logged in to create listings!");
        return res.redirect("/login");
    }
    next();
};

const saveRedirectUrl = (req, res, next) => {
    if (req.session.redirect) {
        res.locals.redirectUrl = req.session.redirect;
    }
    next();
};

const isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing || !listing.owner || !res.locals.currUser || listing.owner.toString() !== res.locals.currUser._id.toString()) {
        req.flash("error", "You are not the owner of the listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details.map(el => el.message).join(", "));
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    } else {
        next();
    }
};

module.exports = {
    isLoggedIn,
    saveRedirectUrl,
    isOwner,
    validateListing,
    validateReview
};

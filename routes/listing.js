const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing = require('../models/listing'); 

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details.map(el => el.message).join(", "));
    } else {
        next();
    }
};

//index
router.get("/",wrapAsync (async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });

}));

//new route to submit new listings
router.get("/new",(req,res)=>{
    res.render("listings/new.ejs")
})

// show route
router.get("/:id",wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    res.render("listings/show.ejs", { listing });
}));


//create route 
router.post("/",validateListing, wrapAsync (async(req, res,next) => {

        const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash('success', 'Successfully created a new listing!');
        res.redirect("/listings");

})
    
);

//edit route
router.get("/:id/edit",wrapAsync( async(req,res)=>{
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
    
}));
    //update route
router.put('/:id',validateListing,wrapAsync( async (req, res) => {
    
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing, { runValidators: true });
    req.flash("success","listing updated");
    res.redirect(`/listings/${id}`);
}));

//delete route
router.delete('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","listing deleted!");
    res.redirect('/listings');
}));

module.exports = router;
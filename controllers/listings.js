const Listing = require("../models/listing");


module.exports.index=async (req, res) => {
    const allListings = await Listing.find({}).populate("owner");
    res.render("listings/index", { allListings });
};

module.exports.renderNewForm= (req, res) => {
    res.render("listings/new.ejs")
};

module.exports.showListing=async (req, res) => {
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
        req.flash("error", "Listing you  requested for does not exists!");
        res.redirect("/listings");
        return;
    }

    res.render("listings/show.ejs", { listing });
};

module.exports.createListing=async (req, res, next) => {
    let url=req.file.path;
    let filename=req.file.filename;

    console.log(url,"..",filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.editListing=async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    
    // Update the basic listing information
    listing.set({ ...req.body.listing });
    
    // Update the image if a new one is uploaded
    if(req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    
    // Save the updated listing
    await listing.save();
    req.flash("success", "Listing update!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing=async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "listing deleted!");
    res.redirect('/listings');
};
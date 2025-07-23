const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })// to upload images

const Listing = require('../models/listing');
const { isLoggedIn, isOwner,validateListing } = require("../middleware.js");
const listingController=require("../controllers/listings.js");

//in tis below line we combined the two route of same route like("/")

router.route("/")
  .get(isLoggedIn, wrapAsync(listingController.index))
  /*.post(isLoggedIn, validateListing, wrapAsync(listingController.createListing));*/
  .post(upload.single('listing[image]'),(req,res)=>{
    res.send(req.file);
  });
  
router.get("/new", isLoggedIn,listingController.renderNewForm)

router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, validateListing, isOwner, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));


router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));



module.exports = router;
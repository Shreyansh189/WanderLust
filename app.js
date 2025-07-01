const express=require('express');
const app=express();
const mongoose=require('mongoose');
const Listing = require('./models/listing'); // Import the listing model
const Mongo_url="mongodb://127.0.0.1:27017/Website";//this is the URL to connect to the MongoDB database
const path=require("path");
const methodoverride=require("method-override");
const ejsMate=require("ejs-mate");
const { prototype } = require('events');
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js")
const {listingSchema}=require("./schema.js");


main().then(()=>{
    console.log("Connected to MongoDB");
})
.catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodoverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"public")));


async function main(){//this function is used to connect to the MongoDB database
    await mongoose.connect(Mongo_url);
} 


app.get('/',(req,res)=>{//this is the starting route to check if the server is running or not
    res.send("Airbnb");
});
const validateListing=(req,res,next)=>{
let {error}= listingSchema.validate(req.body);
if(error){
    throw new ExpressError(400,result)
}else{
    next();
}
   console.log(result);
   if(result.error){
    throw new ExpressError(400,result.error);
   }
};

app.get("/listings",wrapAsync (async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });

}));

//new route to submit new listings
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
})

// show route
app.get("/listings/:id",wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

//create route 
app.post("/listings",validateListing, wrapAsync (async(req, res,next) => {
   
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");

})
    
);

//edit route
app.get("/listings/:id/edit",wrapAsync( async(req,res)=>{
     let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
    
}));

//update route
app.put('/listings/:id',validateListing,wrapAsync( async (req, res) => {
    
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing, { runValidators: true });
    res.redirect(`/listings/${id}`);
}));

//delete route
app.delete('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"))
});


app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs",{message})
    //res.status(statusCode).send(message);
});

app.listen(8080,()=>{//local server running on port 8080
    console.log("Server is running on port 8080");
});


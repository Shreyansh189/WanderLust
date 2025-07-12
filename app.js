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
const {listingSchema,reviewSchema}=require("./schema.js");
const Review =require("./models/review.js")
const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");




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

app.use("/listings",listings);//using the listings routes from the listing.js file  
app.use("/listings/:id/reviews",reviews);//using the reviews routes from the review.js file

const validateReview=(req,res,next)=>{
let {error}= reviewSchema.validate(req.body);
if(error){
    throw new ExpressError(400,error.details[0].message)
}else{
    next();
}  
};



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

 
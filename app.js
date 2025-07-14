const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('./schema.js');

const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js');

const app = express();
const Mongo_url = "mongodb://127.0.0.1:27017/Website";

// MongoDB Connection
async function main() {
    await mongoose.connect(Mongo_url);
}
main()
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Error connecting to MongoDB:", err));

// App Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session and Flash Configuration
const sessionOptions = {
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};
app.use(session(sessionOptions));
app.use(flash());

// Set local variables for all views
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    
    next();
});

// Routes
app.get('/', (req, res) => {
    res.send("Airbnb");
});
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

// Error Handling
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// Start Server
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});

const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

// GET signup form
router.get("/signup", (req, res) => {
    if (req.isAuthenticated()) {
        req.flash("error", "You are already signed in!");
        return res.redirect("/listings");
    }
    res.render("users/signup.ejs");
});

// POST signup
router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser,(err)=>{
            if(err){
            return next(err);
            }
            req.flash("success", "Welcome to WanderLust!");
            res.redirect("/listings");//after signup will redirect to listing page
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

// GET login form
router.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
        req.flash("error", "You are already signed in!");
        return res.redirect("/listings");
    }
    res.render("users/login.ejs");
});

// POST login
router.post("/login", passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
}), async (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
});
router.get("/logout",(req,res)=>{
req.logout((err)=>{
if(err){
    return next(err);
}
req.flash("success","you are logged out!")
res.redirect("/listings");
});
});

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController=require("../controllers/user.js");

// GET signup form
router.get("/signup", userController.renderSignupForm);
// POST signup
router.post("/signup", wrapAsync(userController.signupUser));

// GET login form
router.get("/login", userController.renderLoginForm);
// POST login
router.post("/login", saveRedirectUrl, passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
}), userController.loginUser);

// GET logout
router.get("/logout", userController.logoutUser);

module.exports = router;

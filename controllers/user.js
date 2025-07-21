const user=require("../models/user")
const Listing=require("../models/listing")


// Render signup form (GET /signup)
module.exports.renderSignupForm = (req, res) => {
    if (req.isAuthenticated()) {
        req.flash("error", "You are already signed in!");
        return res.redirect("/listings");
    }
    res.render("users/signup.ejs");
};

// Handle signup (POST /signup)
module.exports.signupUser = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new user({ email, username });
        const registeredUser = await user.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to WanderLust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

// Render login form (GET /login)
module.exports.renderLoginForm = (req, res) => {
    if (req.isAuthenticated()) {
        req.flash("error", "You are already signed in!");
        return res.redirect("/listings");
    }
    res.render("users/login.ejs");
};

// Handle login (POST /login)
module.exports.loginUser = (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect(res.locals.redirectUrl || "/listings");
};

// Handle logout (GET /logout)
module.exports.logoutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};
    


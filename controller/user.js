const User = require("../models/user.js");


module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup");
};


module.exports.signup = async (req, res,next) => {
  try {
    let { username, email, password } = req.body;

    const newUser = new User({ username, email });

    const registeredUser = await User.register(newUser, password);

    console.log("Registered user:", registeredUser);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }

      req.flash("success", "Welcome to StayEase!");
      res.redirect("/listings");
    });

  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};


module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};


module.exports.login = async (req, res) => {

  req.flash("success", "Welcome back to StayEase!");

  // Get the page user originally wanted to visit
  let redirectUrl = req.session.redirectUrl || "/listings";

  // Remove it after using it
  delete req.session.redirectUrl;

  res.redirect(redirectUrl);
};


module.exports.logout = (req, res, next) => {

  req.logout(function (err) {

    if (err) {
      return next(err);
    }

    req.flash("success", "You have been logged out.");

    res.redirect("/listings");
  });
};
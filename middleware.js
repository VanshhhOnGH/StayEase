const Review = require("./models/review");
const Listing = require("./models/Listing");
const { listingSchema, reviewSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");


module.exports.isLoggedin = (req, res, next) => {
  if (!req.isAuthenticated()) {

    
    req.session.redirectUrl = req.originalUrl;

    req.flash("error", "You must be logged in first!");

    return res.redirect("/login");
  }

  next();
};



module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);

  if (!listing.owner.equals(res.locals.currentUser._id)) {
    req.flash("error", "You are not the owner of this listing!");

    return res.redirect(`/listings/${id}`);
  }

  next();
};

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errormessages = error.details
      .map((el) => el.message)
      .join(",");

    throw new ExpressError(errormessages, 400);
  }

  next();
};


const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errormessages = error.details
      .map((el) => el.message)
      .join(",");

    throw new ExpressError(errormessages, 400);
  }

  next();
};


module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }

  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {

  let { id, reviewId } = req.params;

  let review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found!");

    return res.redirect(`/listings/${id}`);
  }

  if (!review.author.equals(res.locals.currentUser._id)) {

    req.flash(
      "error",
      "You are not the author of this review!"
    );

    return res.redirect(`/listings/${id}`);
  }

  
  next();
};

module.exports.validateListing = validateListing;
module.exports.validateReview = validateReview;
const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../Models/review.js");
const Listing = require("../Models/Listing.js");
const { isLoggedin,isReviewAuthor,validateReview} = require("../middleware.js");
const reviewController = require("../controller/review.js");


// post review route
router.post(
  "/",
  isLoggedin,
  validateReview,
  wrapAsync(reviewController.createReview),
);

//delete review route
router.delete(
  "/:reviewId",
  isLoggedin,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview),
);

module.exports = router;

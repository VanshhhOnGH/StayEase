const joi = require("joi");

module.exports.listingSchema = joi.object({
  listing: joi
    .object({
      title: joi.string().required(),
      description: joi.string().required(),
      image: joi.object({
        url: joi.string().required(),
      }),
      price: joi.number().required().min(0).max(10000),
      location: joi.string().required(),
      country: joi.string().required(),
    })
    .required(),
});

module.exports.reviewSchema = joi.object({
  review: joi
    .object({
      rating: joi.number().required().min(1).max(5),
      comment: joi.string().required().max(200),
    })
    .required(),
});

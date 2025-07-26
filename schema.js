const Joi = require('joi');

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().min(1).required(),
    price: Joi.number().required(),
    image: Joi.string().allow("", null),
    
    // ADD THIS FOR MAP COORDINATES
    geometry: Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2)
    }).optional()
    
  }).required(),
  
  // ADD THESE FOR THE SEPARATE COORDINATE FIELDS WE'RE USING
  selectedLng: Joi.number().optional().allow(""),
  selectedLat: Joi.number().optional().allow("")
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required()
  }).required()
});

const mongoose = require('mongoose');
const review = require('./review');
const Schema= mongoose.Schema;
const  listingSchema=new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
        url:String,
        filename:String
    },
    price: { type: Number, required: true },
    location: { type: String, },
    country: { type: String, },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review" // Reference to the Review model
    }],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
});
listingSchema.pre('findOneAndDelete', async function (next) {
    const listing = this;
    await review.deleteMany({ _id: { $in: listing.reviews } });
    next();
});

const listing=mongoose.model('Listing',listingSchema);
module.exports= listing; // Export the model so it can be used in other files

const mongoose = require('mongoose');
const review = require('./review');
const Schema= mongoose.Schema;
const  listingSchema=new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        set: (v) => v === "" ? "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60" : v,
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

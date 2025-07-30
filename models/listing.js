const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
        url: String,
        filename: String
    },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    country: { type: String, required: true },

    // Geometry field for map integration (Leaflet/Google Maps)
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // GeoJSON [longitude, latitude]
            required: true
        }
    },

    tags: [{ type: String }], // Array of tags for filtering/searching

    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Create text index for efficient full-text search on multiple fields
listingSchema.index({
    title: 'text',
    location: 'text',
    country: 'text',
    description: 'text'
});

// Middleware: Automatically delete associated reviews when a listing is deleted
listingSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;

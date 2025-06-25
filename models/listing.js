const mongoose = require('mongoose');
const Schema= mongoose.Schema;
const  listingSchema=new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
  image: { type: String, 
        default:"https://plus.unsplash.com/premium_photo-1684508638760-72ad80c0055f?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set:(v)=>v===""? "https://plus.unsplash.com/premium_photo-1684508638760-72ad80c0055f?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D":v,
         }, // Assuming Image is a URL or path to the image
    price: { type: Number, required: true },
    location: { type: String, },
    country: { type: String, }
});

const listing=mongoose.model('Listing',listingSchema);
module.exports= listing; // Export the model so it can be used in other files
// Note: The export statement should be corrected to `module.exports` instead of `module.export'
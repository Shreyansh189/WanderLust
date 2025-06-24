const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");
const Mongo_url="mongodb://127.0.0.1:27017/Website";//this is the URL to connect to the MongoDB database
main().then(()=>{
    console.log("Connected to MongoDB");
})
.catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

async function main(){//this function is used to connect to the MongoDB database
    await mongoose.connect(Mongo_url);
} 

const initDB=async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("data was initialized");

};
initDB().catch((err) => {
    console.error("Error initializing database:", err);
});

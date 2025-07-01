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
    initData.data = initData.data.map(obj => ({...obj, owner: '66854f31b0e9185a5a1f6a1e'}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");

};
initDB().catch((err) => {
    console.error("Error initializing database:", err);
});

// Utility: Clear all listings if run with 'clear' argument
if (process.argv[2] === 'clear') {
    main().then(async () => {
        await Listing.deleteMany({});
        console.log('All listings deleted.');
        process.exit();
    });
}

const mongoose = require("mongoose");
const {MONGO_URI} = require("../constants/constants");

const connectDatabase = async () => {
    try {
        // MongoDB Roles: atlasAdmin@admin
        // trong url có phần tên database mongodb.net:27017/fashionstore?
        const connection = await mongoose.connect(MONGO_URI,{
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        console.log("Mongo connected");
    }catch (error){
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDatabase;
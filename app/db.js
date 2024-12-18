const { MongoClient } = require("mongodb");
const MONGODB_URI = "mongodb://cozzarin_mongo:27017";
const DB_NAME = "auctiondb";
let cachedDb;

module.exports = {
    connectToDatabase: async () => {
      if (cachedDb) {
        console.log("Existing cached connection found!");
        return cachedDb;
      }
      console.log("Aquiring new DB connection....");
      try {
        const client = await MongoClient.connect(MONGODB_URI);
        const db = client.db(DB_NAME);
        cachedDb = db;
        return db;
      } catch (error) {
        console.log("ERROR aquiring DB Connection!");
        console.log(error);
        throw error;
      }
    }
  };
  
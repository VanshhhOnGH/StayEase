const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../Models/Listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const MONGO_URL = "mongodb://127.0.0.1:27017/StayEase";

const geocodingClient = mbxGeocoding({
  accessToken: process.env.MAP_TOKEN,
});

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("connected to DB");

  await Listing.deleteMany({});

  const listings = [];

  for (let obj of initData.data) {
    const response = await geocodingClient
      .forwardGeocode({
        query: `${obj.location}, ${obj.country}`,
        limit: 1,
      })
      .send();

    if (!response.body.features.length) {
      console.log(`Location not found: ${obj.location}, ${obj.country}`);
      continue;
    }

    listings.push({
      ...obj,
      owner: "6a76dd81ce79dc944471e722",
      geometry: response.body.features[0].geometry,
    });
  }

  await Listing.insertMany(listings);

  console.log("data was initialized");
  await mongoose.connection.close();
}

main().catch((err) => {
  console.log(err);
});
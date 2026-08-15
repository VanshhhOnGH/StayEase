const  Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const search = req.query.search;

  let allListings;

  if (search) {
    allListings = await Listing.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } }
      ]
    });
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index", { allListings });
};

module.exports.rendernewform = async (req, res) => {
  if(!req.isAuthenticated()){
    req.flash("error", "You must be logged in first!");
    return res.redirect("/login");
  }
  res.render("listings/new.ejs");
};

module.exports.showListing =async (req, res) => {
  let id = req.params.id.trim();
  const listing = await Listing.findById(id).populate({path: "reviews", populate: { path: "author" }}).populate("owner");
  if(!listing){
    req.flash("error", "Listing Not Found!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient.forwardGeocode({
    query: `${req.body.listing.location}, ${req.body.listing.country}`,
    limit: 1
  }).send();

  req.body.listing.geometry = response.body.features[0].geometry;

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry;

  let savedListing = await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let id = req.params.id.trim();
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error", "Listing Not Found!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("upload/", "upload/w_300,h_300,c_fill/");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};


module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let response = await geocodingClient.forwardGeocode({
    query: `${req.body.listing.location}, ${req.body.listing.country}`,
    limit: 1
  }).send();

  let listing = await Listing.findByIdAndUpdate(
    id,
    {
      ...req.body.listing,
      geometry: response.body.features[0].geometry
    },
    { returnDocument: "after" }
  );

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};


module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;

  let deletedListing = await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");

  res.redirect("/listings");
};
const Listing = require("../models/listing");
const axios=require("axios");


// Geocoding function - unchanged
  
// Geocoding function
const geocodeLocation = async (location) => {
  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: location,
        format: "json",
        limit: 1
      },
      headers: {
        "User-Agent": "WanderLustApp/1.0 (your_email@example.com)" // Required
      }
    });

    const data = response.data;
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      return [lon, lat]; // GeoJSON uses [lng, lat]
    }

    console.warn("⚠️ No geocoding result, defaulting to Delhi:", location);
    return [77.2090, 28.6139]; // Default fallback
  } catch (error) {
    console.error("❌ Geocoding error:", error.message);
    return [77.2090, 28.6139];
  }
};

// INDEX: List all listings with optional search, sort, and tag filtering
module.exports.index = async (req, res) => {
  const { tag, search, sort = "title", order = "asc" } = req.query;

  let query = {};

  // Tag filtering
  if (tag) {
    query.tags = tag;
  }

  // Search filtering combined with tag filter if both present
  if (search && search.trim()) {
    const searchQuery = {
      $or: [
        { title: { $regex: search.trim(), $options: "i" } },
        { location: { $regex: search.trim(), $options: "i" } },
        { country: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ],
    };

    if (query.tags) {
      query = { $and: [{ tags: query.tags }, searchQuery] };
    } else {
      query = searchQuery;
    }
  }

  // Validate sort to prevent injection or errors
  const validSortFields = ["title", "price", "location", "country", "createdAt"];
  const sortField = validSortFields.includes(sort) ? sort : "title";
  const sortOrder = order === "desc" ? -1 : 1;
  const sortOptions = {};
  sortOptions[sortField] = sortOrder;

  try {
    const allListings = await Listing.find(query)
      .sort(sortOptions)
      .populate("owner");

    // Send necessary info to view for UI reflection
    res.render("listings/index", {
      allListings,
      currentTag: tag || "",
      search: search || "",
      currentSort: sortField,
      currentOrder: order,
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    req.flash("error", "Unable to fetch listings.");
    res.redirect("/listings");
  }
};

// Render New Listing Form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// Show single listing detail
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

// Create Listing Handler (with tags support)
module.exports.createListing = async (req, res, next) => {
  try {
    // Normalize tags field to always be Array
    if (!req.body.listing.tags) req.body.listing.tags = [];
    else if (typeof req.body.listing.tags === "string") {
      req.body.listing.tags = [req.body.listing.tags];
    }

    const listingData = { ...req.body.listing };

    // Clean coordinate fields to avoid issues
    delete listingData.coordinates;
    delete listingData.geometry;

    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;

    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    // Use coordinates from map selection if available
    if (
      req.body.selectedLng &&
      req.body.selectedLat &&
      req.body.selectedLng !== "" &&
      req.body.selectedLat !== "" &&
      req.body.selectedLng !== "0" &&
      req.body.selectedLat !== "0"
    ) {
      newListing.geometry = {
        type: "Point",
        coordinates: [
          parseFloat(req.body.selectedLng),
          parseFloat(req.body.selectedLat),
        ],
      };
    }
    // Fallback geocoding
    else if (req.body.listing.location) {
      const coordinates = await geocodeLocation(
        `${req.body.listing.location}, ${req.body.listing.country}`
      );
      newListing.geometry = {
        type: "Point",
        coordinates,
      };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (error) {
    next(error);
  }
};

// Render Edit Listing Form
module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", { listing });
};

// Update Listing Handler (with tags support)
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  if (!req.body.listing.tags) req.body.listing.tags = [];
  else if (typeof req.body.listing.tags === "string") {
    req.body.listing.tags = [req.body.listing.tags];
  }

  let listing = await Listing.findById(id);

  listing.set({ ...req.body.listing });

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  if (req.body.listing.location) {
    const coordinates = await geocodeLocation(
      `${req.body.listing.location}, ${req.body.listing.country}`
    );
    listing.geometry = {
      type: "Point",
      coordinates,
    };
  }

  await listing.save();
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

// Delete Listing
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};

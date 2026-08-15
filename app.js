if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const dns = require("dns");
dns.setServers(["1.1.1.1"]);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const pagesRouter = require("./routes/pages.js");

const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");

const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./Models/user.js");

const dbUrl = process.env.ATLASDB_URL;

const defaultListingImageUrl =
  "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?auto=format&fit=crop&w=800&q=60";


function getListingImageUrl(image) {
  if (!image) return defaultListingImageUrl;

  if (typeof image === "string") {
    const directUrlMatch = image.match(/^https?:\/\//i);

    if (directUrlMatch) return image;

    const legacyUrlMatch = image.match(/url:\s*['\"]([^'\"]+)['\"]/i);

    if (legacyUrlMatch?.[1]) {
      return legacyUrlMatch[1];
    }

    return defaultListingImageUrl;
  }

  return image.url || defaultListingImageUrl;
}

app.locals.getListingImageUrl = getListingImageUrl;


async function main() {
  await mongoose.connect(dbUrl);

}

main()
  .then(() => {
    console.log("connect to DB");
  })
  .catch((err) => {
    console.log(err);
  });



app.engine("ejs", ejsMate);

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  collectionName: "sessions",
  ttl: 7 * 24 * 60 * 60,
});

store.on("error", (err) => {
  console.log("Error in MongoStore session:", err);
});


const sessionOptions = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));

app.use(flash());

app.use(passport.initialize());

app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewsRouter);

app.use("/", userRouter);

app.use(pagesRouter);


app.all(/.*/, (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});


app.use((err, req, res, next) => {
  let {
    statusCode = 500,
    message = "Something went wrong",
  } = err;

  res.status(statusCode).render("listings/error", { err });
});


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
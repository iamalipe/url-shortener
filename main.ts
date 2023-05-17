import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import shortUrlModel from "./models/shortUrlModel";

const EXPRESS_PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL || "";

const app = express();
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

// Connecting to the database
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log(`🟢 successfully connected to database`);
  })
  .catch((error) => {
    console.log(`🔴 database connection failed. exiting now...`);
    console.error(error);
    process.exit(1);
  });

app.post("/shortUrl", async (req, res) => {
  await shortUrlModel.create({ full: req.body.fullUrl });
  res.redirect("/");
});

app.get("/", async (req, res) => {
  const shortUrls = await shortUrlModel.find();
  res.render("index", { shortUrls: shortUrls });
});

app.get("/:shortUrl", async (req, res) => {
  const shortUrl = await shortUrlModel.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});

app.listen(EXPRESS_PORT, () => {
  console.log(`🟢 App is running on port ${EXPRESS_PORT}.`);
});

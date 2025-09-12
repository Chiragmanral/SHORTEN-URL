const Url = require("../models/Url");
const { v4: uuidv4 } = require("uuid");

exports.getUserUrls = async (req, res) => {
  const userShortUrls = await Url.find({ createdBy: req.user.id });
  return res.status(200).json({ shortUrls: userShortUrls });
};

exports.createShortUrl = async (req, res) => {
  const { redirectUrl } = req.body;
  const shortId = uuidv4().slice(0, 6);
  try {
    await Url.create({ shortId, redirectUrl, createdBy: req.user.id, visitHistory: [] });
    return res.status(201).json({ shortId });
  } catch {
    return res.status(500).json({ msg: "Error creating short URL" });
  }
};

exports.redirectUrl = async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await Url.findOneAndUpdate(
    { shortId },
    { $push: { visitHistory: { timestamp: Date.now() } } }
  );
  if (!entry) return res.status(404).send("Not found");
  return res.status(200).redirect(entry.redirectUrl);
};

exports.analytics = async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await Url.findOne({ shortId });
  if (!entry) return res.status(404).send("Not found");
  return res.status(200).json({ totalClicks: entry.visitHistory.length + 1 });
};

exports.deleteShortUrl = async (req, res) => {
  const { urlShortId } = req.body;
  const deleted = await Url.deleteOne({ shortId: urlShortId, createdBy: req.user.id });
  return res.status(202).json({ deleted: deleted.deletedCount === 1 });
};

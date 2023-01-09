const express = require("express");
const importDataRouter = express.Router();
const expressAsyncHandler = require("express-async-handler");

const Account = require("../models/account.model");
const Post = require("../models/post.model.js");
const Comment = require("../models/comment.model");

const Report = require("../models/report.model");
const Video = require("../models/video.model");

const { posts, comments } = require("./post.rawdata");
const accounts = require("./account.rawdata");
const videos = require("./video.rawdata");

importDataRouter.post(
  "/removeAll",
  expressAsyncHandler(async (req, res) => {
    await Account.remove({});
    await Post.remove({});
    await Comment.remove({});
    await Report.remove({});
    await Video.remove({});
  })
);

importDataRouter.post(
  "/accounts",
  expressAsyncHandler(async (req, res) => {
    await Account.remove({});
    const importAccounts = await Account.insertMany(accounts);
    res.send({ importAccounts });
  })
);

importDataRouter.get(
  "/accounts/all_id",
  expressAsyncHandler(async (req, res) => {
    const all_id = await Account.find({}).select("_id");
    res.send({ all_id });
  })
);

importDataRouter.post(
  "/posts",
  expressAsyncHandler(async (req, res) => {
    await Post.remove({});
    const importPosts = await Post.insertMany(posts);
    res.send({ importPosts });
  })
);

importDataRouter.get(
  "/posts/all_id",
  expressAsyncHandler(async (req, res) => {
    const all_id = await Post.find({}).select("_id");
    res.send({ all_id });
  })
);

importDataRouter.post(
  "/comments",
  expressAsyncHandler(async (req, res) => {
    await Comment.remove({});
    const importComments = await Comment.insertMany(comments);
    res.send({ importComments });
  })
);

importDataRouter.post(
  "/videos",
  expressAsyncHandler(async (req, res) => {
    await Video.remove({});
    const importVideos = await Video.insertMany(videos);
    res.send({ importVideos });
  })
);

importDataRouter.get(
  "/friend",
  expressAsyncHandler(async (req, res) => {
    const all_id = await Account.find({}).select("_id");
    let count = 1;
    for (let i of all_id) {
      count++;
      const filter = i;

      const update = {
        $set: {
          friends: await Account.find({ _id: { $ne: i } })
            .select("_id")
            .limit(3),
        },
      };

      await Account.updateOne(filter, update);
    }
    const all = await Account.find({}).select(["_id", "friends"]);
    res.send({ all });
  })
);

importDataRouter.get(
  "/request_friend",
  expressAsyncHandler(async (req, res) => {
    const all_id = await Account.find({}).select(["_id", "friends"]);
    let count = 1;
    for (let i of all_id) {
      count++;
      const filter = i;

      const update = {
        $set: {
          friendRequestReceived: await Account.find({
            $and: [{ _id: { $ne: i } }, { _id: { $nin: i["friends"] } }],
          })
            .select("_id")
            .limit(3),
        },
      };
      console.log(i["friends"]);
      await Account.updateOne(filter, update);
    }
    const all = await Account.find({}).select(["_id", "friendRequestReceived"]);
    res.send({ all });
  })
);

module.exports = importDataRouter;

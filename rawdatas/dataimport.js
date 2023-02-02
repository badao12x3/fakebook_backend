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
  "/show_all",
  expressAsyncHandler(async (req, res) => {
    const all = await Account.find({});
    res.send({ all });
  })
);

importDataRouter.get(
  "/accounts/all_id",
  expressAsyncHandler(async (req, res) => {
    const all_id = await Account.find({}).select("id");
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

importDataRouter.post(
  "/friend",
  expressAsyncHandler(async (req, res) => {
    const all_id = await Account.find({}).select("_id");

    for (let i of all_id) {
      const filter = i;
      var listFriends = [];
      for (let j = 0; j < 2; j++) {
        var rd = Math.random() * Object.keys(all_id).length;
        var friend = await Account.findOne({
          $and: [{ _id: { $ne: i } }, { _id: { $nin: listFriends } }],
        })
          .select("_id")
          .skip(rd);
        if (friend) listFriends.push(friend);
      }
      const update = {
        $set: {
          friends: listFriends,
        },
      };

      await Account.updateOne(filter, update);
    }
    const all = await Account.find({}).select(["_id", "friends"]);
    res.send({ all });
  })
);
// block_friend
importDataRouter.post(
  "/block_friend",
  expressAsyncHandler(async (req, res) => {
    const all_id = await Account.find({}).select(["_id", "friends"]);

    for (let i of all_id) {
      var friends = [];
      i["friends"].filter((item) => {
        friends.push(item["_id"]);
      });
      console.log(friends);
      var blockFriends = [];
      for (let j = 0; j < 2; j++) {
        var rd = Math.random() * Object.keys(all_id).length;
        var blockFriend = await Account.findOne({
          $and: [
            { _id: { $ne: i } },
            { _id: { $nin: friends } },
            { _id: { $nin: blockFriends } },
          ],
        })
          .select("_id")
          .skip(rd);
        if (blockFriend) blockFriends.push(blockFriend);
      }

      const _filter = i;

      const update = {
        $set: {
          blockedAccounts: blockFriends,
        },
      };

      await Account.updateOne(_filter, update);
    }
    const all = await Account.find({}).select(["_id", "blockedAccounts"]);
    res.send({ all });
  })
);

importDataRouter.post(
  "/received--send_friend",
  expressAsyncHandler(async (req, res) => {
    const all_id = await Account.find({}).select([
      "_id",
      "friends",
      "blockedAccounts",
    ]);
    for (let i of all_id) {
      const filter_received = { _id: i["_id"] };
      var friends = [];
      i["friends"].filter((item) => {
        friends.push(item["_id"]);
      });
      var blockFriends = [];
      i["blockedAccounts"].filter((item) => {
        blockFriends.push(item["_id"]);
      });
      for (let j = 0; j < 2; j++) {
        var friendRequestReceived = [];
        if (i["friendRequestReceived"])
          i["friendRequestReceived"].filter((item) => {
            friendRequestReceived.push(item["_id"]);
          });
        var friendRequestSent = [];
        if (i["friendRequestSent"])
          i["friendRequestSent"].filter((item) => {
            friendRequestSent.push(item["_id"]);
          });

        var rd = Math.random() * Object.keys(all_id).length;
        var requestFriend = await Account.findOne({
          $and: [
            { _id: { $ne: i["_id"] } },
            { _id: { $nin: friends } },
            { _id: { $nin: blockFriends } },
            { _id: { $nin: friendRequestReceived } },
            { _id: { $nin: friendRequestSent } },
          ],
        })
          .select("_id")
          .skip(rd);
        if (requestFriend) {
          var date = Date.now();
          const id_received = {
            _id: requestFriend["_id"],
            createdAt: date,
          };
          const update_received = {
            $push: {
              friendRequestReceived: id_received,
            },
          };

          const filter_send = {
            _id: requestFriend["_id"],
          };
          const id_send = {
            _id: i["_id"],
            createdAt: date,
          };
          const update_send = {
            $push: {
              friendRequestSent: id_send,
            },
          };

          await Account.updateOne(filter_received, update_received);
          await Account.updateOne(filter_send, update_send);
        }
        i = await Account.findById(i["_id"]);
      }
    }

    const about_friend = await Account.find({}).select([
      "_id",
      "friend",
      "friendRequestReceived",
      "friendRequestSent",
    ]);
    res.send({ about_friend });
  })
);

module.exports = importDataRouter;

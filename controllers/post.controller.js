const express = require("express");
const expressAsyncHandler = require("express-async-handler");

const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const Account = require("../models/account.model");
const {
  setAndSendResponse,
  responseError,
} = require("../constants/response_code");
const { isNumber, isValidId } = require("../validations/validateData");

const postsController = {};
postsController.get_post = expressAsyncHandler(async (req, res) => {
  const id = req.params.id;
  // chưa tìm được cách nhập /:id mà trả về undefined
  if (id === undefined)
    return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);
  if (!isValidId(id)) {
    return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);
  }
  let post = await Post.findById(id);
  if (post == null) {
    return setAndSendResponse(res, responseError.POST_IS_NOT_EXISTED);
  }
  let author = await Account.findOne({ _id: post.account_id }).exec();
  try {
    const isBlocked =
      author.blockedAccounts.findIndex((element) => {
        return element.account.toString() === req.account._id.toString();
      }) !== -1;
    if (isBlocked) return res.status(200).json({ data: { is_blocked: "1" } });

    let result = {
      id: post._id,
      described: post.described,
      createdAt: post.createdAt.toString(),
      updatedAt: post.updatedAt.toString(),
      likes: post.likes,
      comments: post.comments,
      author: {
        id: author._id,
        name: author.name,
        avatar: author.getAvatar(),
      },
      is_liked: post.likedAccounts.includes(req.account._id) ? "1" : "0",
      status: post.status,
      is_blocked: isBlocked ? "1" : "0",
      can_edit: req.account._id.equals(author._id)
        ? post.banned
          ? "0"
          : "1"
        : "0",
      banned: post.banned,
      can_comment: post.canComment ? "1" : "0",
    };
    if (post.images.length !== 0) {
      result.images = post.images.map((image) => {
        let { url, publicId } = image;
        return { url: url, publicId: publicId };
      });
    }
    if (post.video && post.video.url != undefined) {
      result.video = {
        url: post.video.url,
        publicId: post.getVideoThumb(),
      };
    }

    res.json({
      code: responseError.OK.statusCode,
      message: responseError.OK.body,
      data: result,
    });
  } catch (err) {
    return setAndSendResponse(res, responseError.UNKNOWN_ERROR);
  }
});

postsController.get_list_posts = expressAsyncHandler(async (req, res) => {
  var { index, count, last_id } = req.query;
  if (!index || !count)
    return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);
  index = parseInt(index);
  count = parseInt(count);
  if (!isNumber(index) || !isNumber(count) || index < 0 || count < 1)
    return setAndSendResponse(res, responseError.PARAMETER_TYPE_IS_INVALID);
  const posts = await Post.find()
    .populate({ path: "account_id", model: Account })
    .sort("-createdAt");
  // console.log(posts.map(post => post._id));
  if (posts.length < 1) {
    return setAndSendResponse(res, responseError.NO_DATA);
  }
  let index_last_id;
  if (last_id)
    index_last_id = posts.findIndex((element) => {
      return element._id == last_id;
    });
  else index_last_id = index - 1;
  // console.log(index_last_id);
  let slicePosts = posts.slice(index_last_id + 1, index_last_id + 1 + count);
  // console.log(slicePosts)
  if (slicePosts.length < 1) {
    // console.log('No have posts');
    return setAndSendResponse(res, responseError.NO_DATA);
  }
  let result = {
    posts: slicePosts.map((post) => {
      const isBlocked =
        post.account_id.blockedAccounts.findIndex((element) => {
          return element.account.toString() === req.account._id.toString();
        }) !== -1;
      let subResult = {
        id: post._id,
        described: post.described,
        createdAt: post.createdAt.toString(),
        updatedAt: post.updatedAt.toString(),
        likes: post.likes,
        comments: post.comments,
        author: {
          id: post.account_id._id,
          name: post.account_id.name,
          avatar: post.account_id.getAvatar(),
        },
        is_liked: post.likedAccounts.includes(req.account._id) ? "1" : "0",
        status: post.status,
        is_blocked: isBlocked ? "1" : "0",
        can_edit: req.account._id.equals(post.account_id._id)
          ? post.banned
            ? "0"
            : "1"
          : "0",
        banned: post.banned,
        can_comment: post.canComment ? "1" : "0",
      };
      if (post.images.length !== 0) {
        subResult.images = post.images.map((image) => {
          let { url, publicId } = image;
          return { url: url, publicId: publicId };
        });
      }
      if (post.video && post.video.url != undefined) {
        subResult.video = {
          url: post.video.url,
          publicId: post.getVideoThumb(),
        };
      }
      return subResult;
    }),
    new_items: (index_last_id + 1 - index).toString(),
  };
  if (slicePosts.length > 0) {
    result.last_id = slicePosts[slicePosts.length - 1]._id;
  }
  res.json({
    code: responseError.OK.statusCode,
    message: responseError.OK.body,
    data: result,
  });
});
postsController.like_post = expressAsyncHandler(async (req, res) => {
  const id = req.body.id;
  if (id === undefined)
    return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);
  if (!isValidId(id)) {
    return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);
  }
  let post = await Post.findById(id);
  console.log(id, "-", post);
  if (post == null) {
    return setAndSendResponse(res, responseError.POST_IS_NOT_EXISTED);
  }
  let author = await Account.findOne({ _id: post.account_id }).exec();
  if (author == null) setAndSendResponse(res, responseError.NO_DATA);
  let user = req.account;
  try {
    var isBlocked = false;
    if (author?.blockedAccounts.length != 0)
      isBlocked =
        author?.blockedAccounts.findIndex((element) => {
          return element.account == user._id;
        }) !== -1;
    if (!isBlocked) {
      if (user?.blockedAccounts.length != 0)
        isBlocked =
          user?.blockedAccounts?.findIndex((element) => {
            return element.account == author._id;
          }) !== -1;
    }
    if (isBlocked) return res.status(200).json({ data: { is_blocked: "1" } });

    if (
      post?.likedAccounts.findIndex((element) => {
        return element.equals(user._id);
      }) != -1
    )
      return setAndSendResponse(res, responseError.HAS_BEEN_LIKED);
    else {
      await Post.findOneAndUpdate(
        { _id: id },
        { $push: { likedAccounts: { _id: user._id } } }
      );
      await Post.findOneAndUpdate({ _id: id }, { $inc: { likes: 1 } });
      return setAndSendResponse(res, responseError.OK);
    }
  } catch (err) {
    return setAndSendResponse(res, responseError.UNKNOWN_ERROR);
  }
});
postsController.unlike_post = expressAsyncHandler(async (req, res) => {
  const id = req.body.id;
  if (id === undefined)
    return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);
  if (!isValidId(id)) {
    return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);
  }
  let post = await Post.findById(id);
  if (post == null) {
    return setAndSendResponse(res, responseError.POST_IS_NOT_EXISTED);
  }
  let author = await Account.findOne({ _id: post.account_id }).exec();
  if (author == null) setAndSendResponse(res, responseError.NO_DATA);
  let user = req.account;
  try {
    if (
      post?.likedAccounts.findIndex((element) => {
        return element.equals(user._id);
      }) == -1
    )
      return setAndSendResponse(res, responseError.HAS_NOT_BEEN_LIKED);
    else {
      await Post.findOneAndUpdate(
        { _id: id },
        { $pull: { likedAccounts: user._id } }
      );
      await Post.findOneAndUpdate({ _id: id }, { $inc: { likes: -1 } });
      return setAndSendResponse(res, responseError.OK);
    }
  } catch (err) {
    return setAndSendResponse(res, responseError.UNKNOWN_ERROR);
  }
});
module.exports = postsController;

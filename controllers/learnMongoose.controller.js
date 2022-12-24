const express = require("express");
const expressAsyncHandler = require("express-async-handler");

const Comment = require('../models/comment.model');
const learnMongoosesController = {};

learnMongoosesController.getCountComments = expressAsyncHandler(async (req, res) => {
    const comments = await Comment.find({post_id: '63a5907ee8d3c71414358efd'}).populate('post_id');
    // var json = JSON.parse(comments);
    // var content = json['comments'];
    var x = comments[0].post_id.likedAccounts.includes('63a1dc3c4e9b3304744f8474');
    res.json({x: x});
});

module.exports = learnMongoosesController;
const express = require("express");
const expressAsyncHandler = require("express-async-handler");

const Account = require('../models/account.model');
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const {setAndSendResponse, responseError} = require('../constants/response_code');
const {isNumber, isValidId} = require("../validations/validateData");

const commentController = {};

// commentController.get_comment = expressAsyncHandler(async (req, res)=> {
//     const {id} = req.query;
//     const {account} = req;
//     let {index, count} = req.query;

//     if(!id || !count || index == undefined) return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);

//     if(!isValidId(id)) return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

//     if(!isNumber(index) || !isNumber(count)) return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

//     index = parseInt(index);
//     count = parseInt(count);

//     if(index < 0 || count < 1) return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

//     if(account.isBlocked) return setAndSendResponse(res, responseError.NOT_ACCESS);

//     //load Post, block List
//     const post = await Post.findById(id);

//     res.send(req.params.id)
// });

commentController.get_comment = expressAsyncHandler(async (req, res)=> {
    const {id} = req.body;
    const account = req.account;
    let {index, count} = req.body;

    if(!id) setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);

    if(!isValidId(id)) setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

    // if(!isNumber(index) || !isNumber(count)) setAndSendResponse(res, responseError.PARAMETER_TYPE_IS_INVALID);

    index = parseInt(index);
    count = parseInt(count);

    if(index < 0 || count < 1) setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

    //Check User account is banned or not
    if(account.isBlocked) setAndSendResponse(res, responseError.NOT_ACCESS);

    //load Post banned or not
    const post = await Post.findById(id);

    if(post == null) return setAndSendResponse(res, responseError.POST_IS_NOT_EXISTED);
    if(post.banned === "true") return setAndSendResponse(res, responseError.POST_IS_BANNED);

    //Check User is being blocked by Post's author
    const postAuthor = await Account.findById(post.account_id);

    const beingBlocked = [];
    for(let value of postAuthor.blockedAccounts)
    {
        beingBlocked.push(value.account);
    }
    for(let item of beingBlocked)
    {
        if(item.toString() === account._id.toString()) setAndSendResponse(res, responseError.POST_IS_NOT_EXISTED);  
    }

    //Check User block Post's author
    const blockingList = [];
    for(let value of account.blockedAccounts)
    {
        blockingList.push(value.account);
    }
    for(let item of blockingList)
    {
        if(item.toString() === postAuthor._id.toString()) setAndSendResponse(res, responseError.POST_IS_NOT_EXISTED);
    }

    //Get and check all comments
    const commentList = await Comment.find({
        post_id: id,
        userComment_id: {$nin: blockingList}
    })  .skip(index)
        .limit(count)
        .populate({path: 'userComment_id', model: Account})
        .sort("-createdAt");

    if(commentList.length === 0) setAndSendResponse(res, responseError.NO_DATA);

    res.json({
        code: responseError.OK.statusCode,
        message: responseError.OK.body,
        data: commentsToData(commentList)
    });
});

commentController.set_comment = expressAsyncHandler(async (req, res) => {
    const {id, comment} = req.body;
    let {index, count } = req.body;
    const account = req.account;

    if(index === undefined || !count || !id || !comment) 
        return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);

    index = parseInt(index);
    count = parseInt(count);

    if(!isNumber(index) || !isNumber(count) || index < 0 || count < 1) 
        return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

    //Check Account isBlock ?
    if(account.isBlocked) return setAndSendResponse(res, responseError.NOT_ACCESS);

    //Check number of letters in comment  
    if(comment.trim().length === 0 || comment.length > 500) return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

    if(!isValidId(id)) return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

    try
    {
        let post = await Post.findById(id);

        if(post == null) return setAndSendResponse(res, responseError.POST_IS_NOT_EXISTED);
        if(post.banned === "true") return setAndSendResponse(res, responseError.POST_IS_BANNED);

        //Check User is being blocked by Post's author
        const postAuthor = await Account.findById(post.account_id);

        const beingBlocked = [];
        for(let value of postAuthor.blockedAccounts)
        {
            beingBlocked.push(value.account);
        }
        for(let item of beingBlocked)
        {
            if(item.toString() === account._id.toString()) setAndSendResponse(res, responseError.POST_IS_NOT_EXISTED);  
        }

        //Save new comment
        let myCmt = await new Comment({
            post_id: id,
            userComment_id: account._id,
            content: comment 
        }).save();

        //Get user blockList
        const blockingList = [];
        for(let value of account.blockedAccounts)
        {
            blockingList.push(value.account);
        }

        //Get all comments
        const commentList = await Comment.find({
            post_id: id,
            userComment_id: {$nin: blockingList}
        })  .skip(index)
            .limit(count)
            .sort("-createdAt");

        //Get all commenters
        let cmterIds = commentList.map(cmt => cmt.userComment_id);

        let cmters = await Account.find({_id: {$in: cmterIds}});

        res.json({
            code: responseError.OK.statusCode,
            message: responseError.OK.body,
            data: commentMapper(commentList, cmters)
        })
    }
    catch(error)
    {
        console.log(error);
        setAndSendResponse(res, responseError.UNKNOWN_ERROR);
    }
});

module.exports = commentController;

function commentsToData(commentList)
{
    const data = [];
    for(let cmt of commentList)
    {
        data.push(commentToData(cmt))
    }
    return data;
}

function commentToData(comment)
{
    const commenter = comment.userComment_id;
    return {
        id: comment._id,
        comment: comment.content,
        created: comment.createdAt.getTime().toString(),
        poster: {
            id: commenter._id,
            name: commenter.name
            // avatar: comment.getAvatar()
        }
    }
}

function commentMapper(cmts, cmters)
{
    return cmts.map(cmt => {
        let cmter = cmters.find(cmter => cmter._id.equals(cmt.userComment_id));

        return {
            id: cmt._id,
            comment: cmt.content,
            createdAt: cmt.createdAt.getTime().toString(),
            poster: {
                id: cmter._id,
                name: cmter.name,
                // avatar: cmter.getAvatar()
            }
        }
    });
}
const express = require("express");
const expressAsyncHandler = require("express-async-handler");

const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Account = require('../models/account.model');
const {setAndSendResponse, responseError} = require('../constants/response_code');
const {isNumber, isValidId} = require("../validations/validateData");

const postsController = {};
postsController.get_post = expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    // chưa tìm được cách nhập /:id mà trả về undefined
    if(id === undefined) return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);
    if(!isValidId(id)){
        return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);
    }
    let post = await Post.findById(id);
    if(post == null){
        return setAndSendResponse(res, responseError.POST_IS_NOT_EXISTED);
    }
    let author = await Account.findOne({_id: post.account_id}).exec();
    try{
        const isBlocked = author.blockedAccounts.findIndex((element) => {return element.account.toString() === req.account._id.toString()}) !== -1;
        if(isBlocked) return res.status(200).json({data: {is_blocked: '1'} });

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
                avatar: author.getAvatar()
            },
            is_liked: post.likedAccounts.includes(req.account._id) ? '1' : '0',
            status: post.status,
            is_blocked: isBlocked ? '1' : '0',
            can_edit: req.account._id.equals(author._id) ? (post.banned ? '0':'1') : '0',
            banned: post.banned,
            can_comment: post.canComment ? '1' : '0'
        };
        if(post.images.length !== 0){
            result.images = post.images.map((image)=> {
                let {url, publicId} = image;
                return {url: url, publicId: publicId};
            });
        }
        if(post.video && post.video.url != undefined){
            result.video = {
                url: post.video.url,
                publicId: post.getVideoThumb()
            }
        }

        res.json({
            code: responseError.OK.statusCode,
            message: responseError.OK.body,
            data: result
        });
    }catch(err){
        return setAndSendResponse(res, responseError.UNKNOWN_ERROR);
    }
});

postsController.get_list_posts = expressAsyncHandler(async (req, res) => {
    var {index, count, last_id} = req.query;
    if(!index || !count) return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);
    index = parseInt(index);
    count = parseInt(count);
    if(!isNumber(index) || !isNumber(count) || index < 0 || count < 1)  return setAndSendResponse(res, responseError.PARAMETER_TYPE_IS_INVALID);
    const posts = await Post.find().populate({path: 'account_id', model: Account}).sort("-createdAt");
    console.log(posts.map(post => post._id));
    if (posts.length < 1) {
        return setAndSendResponse(res, responseError.NO_DATA);
    }
    let index_last_id = posts.findIndex((element) => { return element._id == last_id });
    console.log(index_last_id);
    if (index_last_id == -1) {
        last_id = posts[0]._id;
        index_last_id = 0;
    }
    let slicePosts = posts.slice(index_last_id + index, index_last_id + index + count);
    if (slicePosts.length < 1) {
        console.log('No have posts');
        return setAndSendResponse(res, responseError.NO_DATA);
    }
    let result = {
        posts: slicePosts.map(post => {
            const isBlocked = post.account_id.blockedAccounts.findIndex((element) => {return element.account.toString() === req.account._id.toString()}) !== -1;
            return {
                id: post._id,
                described: post.described,
                createdAt: post.createdAt.toString(),
                updatedAt: post.updatedAt.toString(),
                likes: post.likes,
                comments: post.comments,
                author: {
                    id: post.account_id._id,
                    name: post.account_id.name,
                    avatar: post.account_id.getAvatar()
                },
                is_liked: post.likedAccounts.includes(req.account._id) ? '1' : '0',
                status: post.status,
                is_blocked: isBlocked ? '1' : '0',
                can_edit: req.account._id.equals(post.account_id._id) ? (post.banned ? '0' : '1') : '0',
                banned: post.banned,
                can_comment: post.canComment ? '1' : '0'
            };
            if(post.images.length !== 0) {
                result.images = post.images.map((image) => {
                    let {url, publicId} = image;
                    return {url: url, publicId: publicId};
                });
            }
            if(post.video && post.video.url != undefined) {
                result.video = {
                    url: post.video.url,
                    publicId: post.getVideoThumb()
                }
            }
        }),
        new_items: index_last_id.toString(),
        last_id: last_id
    }

    res.json({
        code: responseError.OK.statusCode,
        message: responseError.OK.body,
        data: result
    });
});
module.exports = postsController;
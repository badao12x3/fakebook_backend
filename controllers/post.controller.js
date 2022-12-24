const express = require("express");
const expressAsyncHandler = require("express-async-handler");

const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Account = require('../models/account.model');
const {resCode, response} = require('../constants/response_code');
const {isValidId} = require("../validations/validateData");

const postsController = {};
postsController.get_post = expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    if(id === undefined) return response(res, 1002);
    if(!isValidId(id)){
        return response(res, 1004);
    }
    let post = await Post.findById(id);
    if(post == null){
        return response(res, 9992);
    }
    let author = Account.findOne({_id: post.account_id}).exec();
    try{
        // kiểm tra bị block
        // const isBlocked = post.blockedAccounts.includes(req.account._id) ? '1' : '0';
        const isBlocked = false;
        // if(isBlocked) return res.json({ ...resCode.get(1000), data: {is_blocked: '1'} });

        var countComments = await Comment.find({post_id: id}).countDocuments();
        // var countComments = await Comment.countDocuments({post_id: id}).exec();

        let result = {
            id: post._id,
            described: post.described,
            created: post.createdAt.getTime().toString(),
            updatedAt: post.updatedAt.getTime().toString(),
            like: post.likedAccounts.length.toString(),
            comment: countComments,
            author: {
                id: author._id,
                name: author.name,
                avatar: author.getAvatar()
            },
            // is_liked: post.likedAccounts.includes(req.account._id) ? '1' : '0',
            status: post.status,
            is_blocked: isBlocked,
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
            code: resCode.get(1000).code,
            message: resCode.get(1000).message,
            data: result
        });
    }catch(err){
        return response(res, 1005);
    }
});
const express = require("express");
const expressAsyncHandler = require("express-async-handler");

const Account = require('../models/account.model');
const Post = require("../models/post.model");
const Video = require('../models/video.model');
const {setAndSendResponse, responseError} = require('../constants/response_code');
const {isNumber, isValidId} = require("../validations/validateData");

const videosController = {};
videosController.get_video = expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    // chưa tìm được cách nhập /:id mà trả về undefined
    if(id === undefined) return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);
    if(!isValidId(id)){
        return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);
    }
    let video = await Video.findById(id);
    if(video == null){
        return setAndSendResponse(res, responseError.VIDEO_IS_NOT_EXISTED);
    }
    const result = {
        id: video._id,
        described: video.described,
        video: {
            url: video.video.url,
            publicId: video.video.publicId
        },
        isAdsCampaign: video.isAdsCampaign ? '1' : '0',
        createdAt: video.createdAt.toString(),
        updatedAt: video.updatedAt.toString(),
        likes: video.likes,
        is_liked: video.likedAccounts.includes(req.account._id) ? '1' : '0',
    };
    res.json({
        code: responseError.OK.statusCode,
        message: responseError.OK.body,
        data: result
    });
});

videosController.get_list_videos = expressAsyncHandler(async (req, res) => {
    const videos = await Video.find();
    if(videos == null){
        return setAndSendResponse(res, responseError.VIDEO_IS_NOT_EXISTED);
    }
    const result = {
        videos: videos.map(video => {
            return {
                id: video._id,
                described: video.described,
                video: {
                    url: video.video.url,
                    publicId: video.video.publicId
                },
                isAdsCampaign: video.isAdsCampaign ? '1' : '0',
                createdAt: video.createdAt.toString(),
                updatedAt: video.updatedAt.toString(),
                likes: video.likes,
                is_liked: video.likedAccounts.includes(req.account._id) ? '1' : '0',
            }
        })
    }
    res.json({
        code: responseError.OK.statusCode,
        message: responseError.OK.body,
        data: result
    });
});

module.exports = videosController;
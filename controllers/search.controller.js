const express = require("express");
const expressAsyncHandler = require("express-async-handler");

const Account = require('../models/account.model');
const Post = require("../models/post.model");
const Search = require("../models/search.model");
const Comment = require("../models/comment.model");
const {setAndSendResponse, responseError} = require('../constants/response_code');
const {isValidId} = require("../validations/validateData");
const { ObjectId } = require("mongodb");

const searchController = {};

searchController.search_sth = expressAsyncHandler(async (req,res) => {
    let postList = [];
    let blockList = [];
    let accountList = [];
    const keyword = req.body.keyword;

    if(typeof keyword != "string")
    {
        setAndSendResponse(res, responseError.PARAMETER_TYPE_IS_INVALID);
    }

    accountList = await Account.find().select('blockedAccounts');

    accountList.forEach(e => {
        let temp = [];
        temp.concat(e.blockAccount);
        if(temp.includes(req.account._id))
        {
            blockList.push(e._id);
        }
    })

    postList = await Post.find({
        account_id: { $nin: blockList},
        $text: { $search: keyword}
    })
    .populate({path: 'account_id', model: Account})
    .sort({ score: { $meta: "textScore"}})
    .exec();

    // if(postList.length < 1) return setAndSendResponse(res, responseError.NO_DATA);

    let newSearch = await new Search({
        account_id: req.account._id, keyword: keyword
    }).save();

    const searches = await Search.find({ account_id: req.account._id, keyword: keyword}).sort({ createAt: -1});

    const recentSearch = searches[0];
    const searchIdsToDelete = searches.slice(1).map(search => search._id);

    await Search.deleteMany({ _id: { $in: searchIdsToDelete}})
    res.json({
        code: responseError.OK.statusCode, 
        message: responseError.OK.body, 
        data: postList
    });
});

searchController.get_saved_search = expressAsyncHandler(async (req,res) => {
    let searchList = [];

    searchList = await Search.find({
        account_id: req.account._id
    })
    .limit(5)
    .sort("-createdAt");

    if(searchList.length < 1)
    {
        return setAndSendResponse(res, responseError.NO_DATA);
    }

    res.json({
        code: responseError.OK.statusCode,
        message: responseError.OK.body,
        data: searchList
    })
});

searchController.del_saved_search = expressAsyncHandler(async (req,res) => {
    const {search_id} = req.body;

    let search = await Search.findOne({
        account_id: req.account._id,
        _id: new ObjectId(search_id)
    })

    if(!search) return setAndSendResponse(res, responseError.NO_DATA);
    else Search.deleteOne(
        search,
        (err, result) => {
            if(err){
                return setAndSendResponse(res, responseError.UNKNOWN_ERROR);
            }else{
                return setAndSendResponse(res, responseError.OK, search_id)
            }
        }
    )
});

module.exports = searchController;
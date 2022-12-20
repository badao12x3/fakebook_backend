const express = require("express");
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require("express-async-handler");

const User = require('../models/user.model');
const {resCode, response} = require('../constants/response_code');
const {isValidPassword,isPhoneNumber} = require('../validations/validateData');
const {JWT_SECRET} = require("../constants/constants");

const usersController = {};
usersController.login = expressAsyncHandler(async (req, res) => {
    const {phoneNumber, password} = req.body;
    if (phoneNumber === undefined || password === undefined) {
        return response(res,1002);
    }
    let user = await User.findOne({phoneNumber: phoneNumber, password: password});
    if (user == null){
        return response(res,9994);
    }

    let token = jwt.sign({
        userId: user._id,
        phoneNumber: phoneNumber
    }, JWT_SECRET,{expiresIn: "30d"});
    user.online = true;
    user.token = token;
    user.avatar.url = user.getDefaultAvatar();
    user.save();
    res.json({
        code: resCode.get(1000).code,
        message: resCode.get(1000).message,
        data: {
            id: user._id,
            name: user.name,
            token: token,
            avatar: user.getAvatar(),
            active: user.active
        }
    });
});

usersController.signup = expressAsyncHandler(async (req, res) => {
    const {phoneNumber, password} = req.body;
    if(!phoneNumber || !password){
        return response(res, 1002);
    }
    if(!isPhoneNumber(phoneNumber) || !isValidPassword(password)){
        return response(res, 1004);
    }
    const userExists = await User.findOne({phoneNumber: phoneNumber});
    if(!userExists){
        await new User({phoneNumber: phoneNumber, password: password,
            // uuid: req.query.uuid
        }).save();
        return response(res, 1000);
    }
    else{
        return response(res, 9996);
    }
});


module.exports = usersController;
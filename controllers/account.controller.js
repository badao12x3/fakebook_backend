const express = require("express");
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require("express-async-handler");

const Account = require('../models/account.model');
const {resCode, response} = require('../constants/response_code');
const {isValidPassword,isPhoneNumber} = require('../validations/validateData');
const {JWT_SECRET} = require("../constants/constants");

const accountsController = {};
accountsController.login = expressAsyncHandler(async (req, res) => {
    const {phoneNumber, password} = req.body;
    if (phoneNumber === undefined || password === undefined) {
        return response(res,1002);
    }
    let account = await Account.findOne({phoneNumber: phoneNumber, password: password});
    if (account == null){
        return response(res,9994);
    }

    let token = jwt.sign({
        account_id: account._id,
        phoneNumber: phoneNumber
    }, JWT_SECRET,{expiresIn: "30d"});
    account.online = true;
    account.token = token;
    account.avatar.url = account.getDefaultAvatar();
    account.save();
    res.json({
        code: resCode.get(1000).code,
        message: resCode.get(1000).message,
        data: {
            id: account._id,
            name: account.name,
            token: token,
            avatar: account.getAvatar(),
            active: account.active
        }
    });
});

accountsController.signup = expressAsyncHandler(async (req, res) => {
    const {phoneNumber, password} = req.body;
    if(!phoneNumber || !password){
        return response(res, 1002);
    }
    if(!isPhoneNumber(phoneNumber) || !isValidPassword(password)){
        return response(res, 1004);
    }
    const userExists = await Account.findOne({phoneNumber: phoneNumber});
    if(!userExists){
        await new Account({phoneNumber: phoneNumber, password: password,
            // uuid: req.query.uuid
        }).save();
        return response(res, 1000);
    }
    else{
        return response(res, 9996);
    }
});


module.exports = accountsController;
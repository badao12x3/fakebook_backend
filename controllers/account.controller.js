const express = require("express");
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require("express-async-handler");

const Account = require('../models/account.model');
const { responseError, setAndSendResponse } = require('../constants/response_code');

const {isValidPassword,isPhoneNumber} = require('../validations/validateData');
const {JWT_SECRET} = require("../constants/constants");

const accountsController = {};
accountsController.login = expressAsyncHandler(async (req, res) => {
    const {phoneNumber, password} = req.body;
    if(!phoneNumber || !password){
        return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);
    }
    if(!isPhoneNumber(phoneNumber) || !isValidPassword(password)){
        return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);
    }
    // sẽ sửa lại bcrypt compare hashmap, hiện đang để tạm tìm như thế này
    let account = await Account.findOne({phoneNumber: phoneNumber, password: password});
    if (account == null){
        // return response(res,9994);
        return setAndSendResponse(res, responseError.NO_DATA);
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
        code: responseError.OK.statusCode,
        message: responseError.OK.body,
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
        return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);
    }
    if(!isPhoneNumber(phoneNumber) || !isValidPassword(password)){
        return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);
    }
    const userExists = await Account.findOne({phoneNumber: phoneNumber});
    if(!userExists){
        // CHƯA HASH PASSWORD, làm sau
        await new Account({phoneNumber: phoneNumber, password: password,
            // uuid: req.query.uuid
        }).save();
        return setAndSendResponse(res, responseError.OK);
    }
    else{
        return setAndSendResponse(res, responseError.USER_EXISTED);
    }
});


module.exports = accountsController;
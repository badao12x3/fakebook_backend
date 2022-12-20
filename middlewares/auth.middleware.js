const jwt = require('jsonwebtoken');
const expressAsyncHandler = require("express-async-handler");

const User = require('../models/account.model');
const {resCode, response} = require('../constants/response_code');
const {JWT_SECRET} = require("../constants/constants");

const authToken = expressAsyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization) {
        token = req.headers.authorization;
    }else{
        token = req.query.token;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return response(res,401);
    }
    req.user = await User.findById(decoded.id).select("-password");
    req.decoded = decoded;
    next(); // next để gọi tiếp hàm sau
    if (!token) {
        return response(res, 402);
    }
})

module.exports = authToken;
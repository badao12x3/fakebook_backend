const express = require("express");
const jwt = require("jsonwebtoken");
const expressAsyncHandler = require("express-async-handler");

const Account = require('../models/account.model');

//import cloud storage
const cloudinary = require('../config/cloudinaryConfig')

const { responseError, setAndSendResponse, callRes } = require('../constants/response_code');
const {isValidPassword,isPhoneNumber, isValidId, isValidName, checkLink} = require('../validations/validateData');
const {JWT_SECRET} = require("../constants/constants");

const accountsController = {};

accountsController.login = expressAsyncHandler(async (req, res) => {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
        return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);
    }
    if (!isPhoneNumber(phoneNumber) || !isValidPassword(password)) {
        return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);
    }
    // sẽ sửa lại bcrypt compare hashmap, hiện đang để tạm tìm như thế này
    let account = await Account.findOne({
        phoneNumber: phoneNumber,
        password: password,
    });
    if (account == null) {
        return setAndSendResponse(res, responseError.USER_IS_NOT_VALIDATED);
    }

    let token = jwt.sign(
        {
            account_id: account._id,
            phoneNumber: phoneNumber,
        },
        JWT_SECRET,
        { expiresIn: "30d" }
    );
    account.online = true;
    account.token = token;
    account.avatar.url = account.getAvatar();
    account.save();
    res.status(responseError.OK.statusCode).json({
        code: responseError.OK.body.code,
        message: responseError.OK.body.message,
        data: {
            id: account._id,
            name: account.name,
            token: token,
            avatar: account.getAvatar(),
            active: account.active,
        },
    });
});

accountsController.signup = expressAsyncHandler(async (req, res) => {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
        return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);
    }
    if (!isPhoneNumber(phoneNumber) || !isValidPassword(password)) {
        return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);
    }
    const userExists = await Account.findOne({ phoneNumber: phoneNumber });
    if (!userExists) {
        // CHƯA HASH PASSWORD, làm sau
        await new Account({
            phoneNumber: phoneNumber,
            password: password,
            // uuid: req.query.uuid
        }).save();
        return setAndSendResponse(res, responseError.OK);
    } else {
        return setAndSendResponse(res, responseError.USER_EXISTED);
    }
});

accountsController.del_request_friend = expressAsyncHandler(
    async (req, res) => {
        const { sent_id, received_id } = req.body;
        if (!sent_id || !received_id)
            return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);

        if (!isValidId(sent_id) || !isValidId(received_id) || sent_id === received_id)
            return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

        let account_sent = await Account.findOne({ _id: sent_id }).select([
            "friendRequestReceived",
            "blockedAccounts",
        ]);

        let account_received = await Account.findOne({ _id: received_id }).select([
            "friends",
            "friendRequestSent",
            "blockedAccounts",
        ]);

        if (account_sent == null || account_received == null) {
            return setAndSendResponse(res, responseError.NO_DATA);
        }

        let list_friend_received = account_received["friends"];
        let list_sent_friend = account_received["friendRequestSent"];
        let list_blockedAccounts_received = account_received["blockedAccounts"];

        let list_received_friend = account_sent["friendRequestReceived"];
        let list_blockedAccounts_sent = account_sent["blockedAccounts"];

        let hasRequest = false;
        let hasSent = false;

        for (let i of list_friend_received) {
            if (i["friend"] == received_id) {
                return setAndSendResponse(res, responseError.HAS_BEEN_FRIEND);
            }
        }

        for (let i of list_blockedAccounts_received) {
            if (i["account"] == received_id) {
                return setAndSendResponse(res, responseError.HAS_BLOCK);
            }
        }
        for (let i of list_blockedAccounts_sent) {
            if (i["account"] == sent_id) {
                return setAndSendResponse(res, responseError.HAS_BLOCK);
            }
        }
        for (let i of list_received_friend) {
            if (i["fromUser"] == received_id) {
                hasRequest = true;
                break;
            }
        }


        for (let i of list_sent_friend) {
            if (i["toUser"] == sent_id) {
                hasSent = true;
                break;
            }
        }

        if (hasRequest && hasSent) {
            var new_list_received_friend  = [];
            for (let i of list_received_friend){
                if (i["fromUser"]!=received_id){
                    new_list_received_friend.push(i);
                }
            }

            const filter_sent = {
                _id : sent_id
            }

            const update_sent = {
                $set: {
                    friendRequestReceived: new_list_received_friend
                }
            }

            await Account.updateOne(filter_sent, update_sent);

            var new_list_sent_friend  = [];

            for (let i of list_sent_friend) {
                if (i["toUser"] != sent_id) {
                    new_list_sent_friend.push(i);
                }
            }

            const filter_received = {
                _id : received_id
            }

            const update_received = {
                $set: {
                    friendRequestSent: new_list_sent_friend
                }
            }

            await Account.updateOne(filter_received, update_received);

            return setAndSendResponse(res, responseError.OK);
        }

        return setAndSendResponse(res, responseError.DEL_REQUEST_FRIEND_FAILED);
    }
);


accountsController.set_accept_friend = expressAsyncHandler(
    async (req, res) => {
        const { sent_id, received_id } = req.body;
        if (!sent_id || !received_id)
            return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);

        if (!isValidId(sent_id) || !isValidId(received_id) || sent_id === received_id)
            return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

        let account_sent = await Account.findOne({ _id: sent_id }).select([
            "friendRequestReceived",
            "blockedAccounts",
        ]);

        let account_received = await Account.findOne({ _id: received_id }).select([
            "friends",
            "friendRequestSent",
            "blockedAccounts",
        ]);

        if (account_sent == null || account_received == null) {
            return setAndSendResponse(res, responseError.NO_DATA);
        }

        let list_friend_received = account_received["friends"];
        let list_sent_friend = account_received["friendRequestSent"];
        let list_blockedAccounts_received = account_received["blockedAccounts"];

        let list_received_friend = account_sent["friendRequestReceived"];
        let list_blockedAccounts_sent = account_sent["blockedAccounts"];

        let hasRequest = false;
        let hasSent = false;

        for (let i of list_friend_received) {
            if (i["friend"] == received_id) {
                return setAndSendResponse(res, responseError.HAS_BEEN_FRIEND);
            }
        }

        for (let i of list_blockedAccounts_received) {
            if (i["account"] == received_id) {
                return setAndSendResponse(res, responseError.HAS_BLOCK);
            }
        }
        for (let i of list_blockedAccounts_sent) {
            if (i["account"] == sent_id) {
                return setAndSendResponse(res, responseError.HAS_BLOCK);
            }
        }
        for (let i of list_received_friend) {
            if (i["fromUser"] == received_id) {
                hasRequest = true;
                break;
            }
        }


        for (let i of list_sent_friend) {
            if (i["toUser"] == sent_id) {
                hasSent = true;
                break;
            }
        }

        if (hasRequest && hasSent) {
            var new_list_received_friend  = [];
            for (let i of list_received_friend){
                if (i["fromUser"]!=received_id){
                    new_list_received_friend.push(i);
                }
            }

            const filter_sent = {
                _id : sent_id
            }

            const update_sent = {
                $set: {
                    friendRequestReceived: new_list_received_friend
                },
                $push: {
                    friends: {
                        friend: received_id
                    },
                }
            }

            await Account.updateOne(filter_sent, update_sent);

            var new_list_sent_friend  = [];

            for (let i of list_sent_friend) {
                if (i["toUser"] != sent_id) {
                    new_list_sent_friend.push(i);
                }
            }

            const filter_received = {
                _id : received_id
            }

            const update_received = {
                $set: {
                    friendRequestSent: new_list_sent_friend
                },
                $push: {
                    friends: {
                        friend: sent_id
                    },
                }
            }

            await Account.updateOne(filter_received, update_received);

            return setAndSendResponse(res, responseError.OK);
        }

        return setAndSendResponse(res, responseError.ACCECPT_REQUEST_FRIEND_FAILED);
    }
);

accountsController.set_request_friend = expressAsyncHandler(
    async (req, res) => {
        const { sent_id, received_id } = req.body;
        if (!sent_id || !received_id)
            return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);

        if (
            !isValidId(sent_id) ||
            !isValidId(received_id) ||
            sent_id === received_id
        )
            return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

        let account = await Account.findOne({ _id: sent_id }).select([
            "friends",
            "friendRequestReceived",
            "friendRequestSent",
            "blockedAccounts",
        ]);
        let account_sent = await Account.findOne({ _id: received_id });

        if (account == null || account_sent == null) {
            return setAndSendResponse(res, responseError.NO_DATA);
        }

        let list_friend = account["friends"];
        let list_received_friend = account["friendRequestReceived"];
        let list_sent_friend = account["friendRequestSent"];
        let list_blockedAccounts = account["blockedAccounts"];

        for (let i of list_friend) {
            if (i["friend"] == received_id) {
                return setAndSendResponse(res, responseError.HAS_BEEN_FRIEND);
            }
        }

        for (let i of list_received_friend) {
            if (i["fromUser"] == received_id) {
                return setAndSendResponse(res, responseError.SET_REQUEST_FRIEND_FAILED);
            }
        }

        for (let i of list_sent_friend) {
            if (i["toUser"] == received_id) {
                return setAndSendResponse(res, responseError.SET_REQUEST_FRIEND_FAILED);
            }
        }

        for (let i of list_blockedAccounts) {
            if (i["account"] == received_id) {
                return setAndSendResponse(res, responseError.HAS_BLOCK);
            }
        }

        var date = Date.now();
        const filter_send = {
            _id: sent_id,
        };
        const _sent_id = {
            toUser: received_id,
            createdAt: date,
        };
        const update_send = {
            $push: {
                friendRequestSent: _sent_id,
            },
        };

        const filter_received = {
            _id: received_id,
        };
        const _id_received = {
            fromUser: sent_id,
            createdAt: date,
        };
        const update_received = {
            $push: {
                friendRequestReceived: _id_received,
            },
        };

        await Account.updateOne(filter_send, update_send);
        await Account.updateOne(filter_received, update_received);

        return setAndSendResponse(res, responseError.OK);
    }
);

accountsController.get_requested_friends = expressAsyncHandler(
    async (req, res) => {
        const { _id } = req.query;
        if (!_id) {
            return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);
        } else if (!isValidId(_id)) {
            return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);
        }

        let account = await Account.findOne({ _id: _id }).select(
            "friendRequestReceived"
        );

        if (account == null) {
            return setAndSendResponse(res, responseError.NO_DATA);
        } else {
            return res.status(responseError.OK.statusCode).json({ account });
        }
    }
);

accountsController.set_user_info = expressAsyncHandler( async (req, res) => {
    const {username, description, city,country, link} = req.body;
    const {account} = req;

    // ko gửi thông tin gì lên
    if(!username && !description && !city &&
        !country && !link && !req.files){
        console.log("ko gửi thông tin gì lên")
        return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);
    }
    // mô tả hơn 150 kí tự
    if(description && description.length > 150) {
        console.log("mô tả hơn 150 kí tự");
        return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);
    }

    // tài khoản đã bị khóa
    if(account.isBlocked)  {
        console.log("tài khoản đã bị khóa");
        return setAndSendResponse(res, responseError.NOT_ACCESS);
    }

    // tên sai định dạng
    if(username && !isValidName(username)) {
        console.log("tên sai định dạng");
        return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);
    }
    // tên sai định dạng
    if (city && typeof city !== "string")
        return callRes(res, responseError.PARAMETER_TYPE_IS_INVALID, 'city');
    if (country && typeof country !== "string")
        return callRes(res, responseError.PARAMETER_TYPE_IS_INVALID, 'country');
    if (link ){
        if( typeof link !== "string" )
            return callRes(res, responseError.PARAMETER_TYPE_IS_INVALID, 'link');
        if (!checkLink(link))
            return callRes(res, responseError.PARAMETER_VALUE_IS_INVALID, 'link '+link+' banned');
    }

    if(username) account.name = username;
    if(description) account.description = description;
    if(city) account.city = city;
    if(country) account.country = country;
    if(link) account.link = link;

    // upload avatar
    if(req.files && req.files.avatar){
        if(account.avatar && account.avatar.url !== 'https://res.cloudinary.com/it4895/image/upload/v1607791757/it4895/avatars/default-avatar_jklwc7.jpg'){
            //xóa avatar cũ
            cloudinary.removeImg(account.avatar.publicId);
        }
        // upload avatar mới
        try{
            let data = await cloudinary.uploads(req.files.avatar[0]);
            account.avatar = data;
        }catch (err){
            console.log(err);
            return setAndSendResponse(res, responseError.UPLOAD_FILE_FAILED);
        }
    }

    // upload cover_image
    if(req.files && req.files.cover_image){
        if(account.coverImage){
            //xóa cover_image cũ
            cloudinary.removeImg(account.coverImage.publicId);
        }

        // upload cover_image
        try{
            let data = await cloudinary.uploads(req.files.cover_image[0]);
            account.coverImage = data;
        } catch(err) {
            console.log(err);
            return setAndSendResponse(res, responseError.UPLOAD_FILE_FAILED);
        }
    }

    await account.save();
    let data = {
        avatar: account.getAvatar(),
        cover_image: account.coverImage != undefined ? account.coverImage.url : '',
        username: account.name,
        link: account.link,
        city: account.city,
        country: account.country,
        created: account.createdAt.getTime().toString(),
        description: account.description,
    }

    callRes(res, responseError.OK, data)
})

accountsController.get_user_info = expressAsyncHandler( async (req, res) => {
    const {user_id} = req.query;
    const {account} = req;

    console.log(account);
    if(account.isBlocked) return setAndSendResponse(res, responseError.NOT_ACCESS);

    var user = null;
    let data = {
        id: null,
        username: null,
        created: null,
        description: null,
        avatar: null,
        cover_image: null,
        link: null,
        address: null,
        city: null,
        country: null,
        listing: null,
        is_friend: null,
        online: null
    }

    if(user_id){
        if(!isValidId(user_id)) return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

        user = await Account.findById(user_id);

        if(!user) return setAndSendResponse(res, responseError.NO_DATA);

        console.log(user);

        if(user.isBlocked == true) {
            console.log("tài khoản bị block");
            return setAndSendResponse(res, responseError.USER_IS_NOT_VALIDATED);
        }

        if(user.blockedAccounts){
            let index = user.blockedAccounts.findIndex(element => element.account.equals(account._id));
            if (index >= 0) return callRes(res, responseError.USER_IS_NOT_VALIDATED, 'Bạn bị người ta blocked rồi nên không thể lấy info của họ');
            let index1 = account.blockedAccounts.findIndex(element => element.account.equals(user._id));
            if (index1 >= 0) return callRes(res, responseError.USER_IS_NOT_VALIDATED, 'Bạn đang blocked user muốn lấy info');
        }

        // const [friend, isBlocked] = await Promise.all([
        //     FriendList.findOne({$or: [
        //         {user1_id: account._id, user2_id: user_id},
        //         {user1_id: user_id, user2_id: account._id}
        //     ]}),
        //     FriendBlock.findOne({$or: [
        //         {accountDoBlock_id: user_id, blockedUser_id: account._id},
        // 		{accountDoBlock_id: account._id, blockedUser_id: user_id}
        //     ]})
        // ]);

        // if(friend) isFriend = true;
        // if(isBlocked) return setAndSendResponse(res, responseError.USER_IS_NOT_VALIDATED);
    }else{
        user = account;
    }

    // const friendNum = await FriendList.find({
    // 	$or: [
    // 		{user1_id: user._id},
    // 		{user2_id: user._id}
    // 	]
    // }).countDocuments();

    data.id = user._id.toString();
    data.username = user.name;
    data.created = Math.floor(user.createdAt.getTime() / 1000);
    data.description = user.description;
    data.avatar= user.avatar.url;
    data.cover_image = user.coverImage.url;
    data.link = user.link;
    data.city = user.city;
    data.country = user.country;
    data.listing = user.friends.length;
    data.online = user.online;
    data.is_friend = false;
    if (user_id) {
        let indexExist = user.friends.findIndex(element => element.account.equals(account._id));
        data.is_friend =  (indexExist >= 0) ? true : false;
    }
    return callRes(res, responseError.OK, data);
})

module.exports = accountsController;
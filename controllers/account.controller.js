const express = require("express");
const jwt = require("jsonwebtoken");
const expressAsyncHandler = require("express-async-handler");

const Account = require("../models/account.model");
const {
  responseError,
  setAndSendResponse,
} = require("../constants/response_code");

const {
  isValidPassword,
  isPhoneNumber,
  isValidId,
} = require("../validations/validateData");
const { JWT_SECRET } = require("../constants/constants");
const { findOne } = require("../models/account.model");

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
    // return response(res,9994);
    return setAndSendResponse(res, responseError.NO_DATA);
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
  res.json({
    code: responseError.OK.statusCode,
    message: responseError.OK.body,
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
    const { _id, received_id } = req.body;
    if (!_id || !received_id)
      return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);

    if (!isValidId(_id) || !isValidId(received_id) || _id === received_id)
      return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

    let account = await Account.findOne({ _id: _id }).select([
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
    let hasRequest = false;
    let hasSent = false;

    for (let i of list_friend) {
      if (i["_id"] == received_id) {
        return setAndSendResponse(res, responseError.HAS_BEEN_FRIEND);
      }
    }

    for (let i of list_blockedAccounts) {
      if (i["_id"] == received_id) {
        return setAndSendResponse(res, responseError.SET_REQUEST_FRIEND_FAILED);
      }
    }

    for (let i of list_received_friend) {
      if (i["_id"] == received_id) {
        hasRequest = true;
        break;
      }
    }

    for (let i of list_sent_friend) {
      if (i["_id"] == received_id) {
        hasSent = true;
        break;
      }
    }
    if (hasRequest && hasSent) {
      return setAndSendResponse(res, responseError.OK);
    }
    
    return setAndSendResponse(res, responseError.SET_ACCEPT_FRIEND_FAILED);
  }
);

accountsController.set_accept_friend = expressAsyncHandler(async (req, res) => {
  const { _id, received_id } = req.body;
  if (!_id || !received_id)
    return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);

  if (!isValidId(_id) || !isValidId(received_id) || _id === received_id)
    return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

  let account = await Account.findOne({ _id: _id }).select([
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
  let hasRequest = false;

  for (let i of list_friend) {
    if (i["_id"] == received_id) {
      return setAndSendResponse(res, responseError.HAS_BEEN_FRIEND);
    }
  }

  for (let i of list_blockedAccounts) {
    if (i["_id"] == received_id) {
      return setAndSendResponse(res, responseError.SET_REQUEST_FRIEND_FAILED);
    }
  }

  for (let i of list_received_friend) {
    if (i["_id"] == received_id) {
      hasRequest = true;
      break;
    }
  }

  for (let i of list_sent_friend) {
    if (i["_id"] == received_id) {
      hasRequest = true;
      break;
    }
  }
  if (!hasRequest) {
    return setAndSendResponse(res, responseError.SET_ACCEPT_FRIEND_FAILED);
  }

  return setAndSendResponse(res, responseError.OK);
});

accountsController.set_request_friend = expressAsyncHandler(
  async (req, res) => {
    const { id_send, received_id } = req.body;
    if (!id_send || !received_id)
      return setAndSendResponse(res, responseError.PARAMETER_IS_NOT_ENOUGH);

    if (
      !isValidId(id_send) ||
      !isValidId(received_id) ||
      id_send === received_id
    )
      return setAndSendResponse(res, responseError.PARAMETER_VALUE_IS_INVALID);

    let account = await Account.findOne({ _id: id_send }).select([
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
      if (i["_id"] == received_id) {
        return setAndSendResponse(res, responseError.SET_REQUEST_FRIEND_FAILED);
      }
    }

    for (let i of list_received_friend) {
      if (i["_id"] == received_id) {
        return setAndSendResponse(res, responseError.SET_REQUEST_FRIEND_FAILED);
      }
    }

    for (let i of list_sent_friend) {
      if (i["_id"] == received_id) {
        return setAndSendResponse(res, responseError.SET_REQUEST_FRIEND_FAILED);
      }
    }

    for (let i of list_blockedAccounts) {
      if (i["_id"] == received_id) {
        return setAndSendResponse(res, responseError.SET_REQUEST_FRIEND_FAILED);
      }
    }

    var date = Date.now();
    const filter_send = {
      _id: id_send,
    };
    const _id_send = {
      _id: received_id,
      createdAt: date,
    };
    const update_send = {
      $push: {
        friendRequestSent: _id_send,
      },
    };

    const filter_received = {
      _id: received_id,
    };
    const _id_received = {
      _id: id_send,
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
    const { _id } = req.body;
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

module.exports = accountsController;

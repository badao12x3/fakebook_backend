const resCode = new Map();

// resCode.set(1000, {code: "1000", message: "OK"});
// resCode.set(1001, {code: "1001", message: "Can not connect to DB"});
// resCode.set(1002, {code: "1002", message: "Parameter is not enough"});
// resCode.set(1003, {code: "1003", message: "Parameter type is invalid"});
// resCode.set(1004, {code: "1004", message: "Parameter value is invalid"});
// resCode.set(1005, {code: "1005", message: "Unknown error"});
// resCode.set(1006, {code: "1006", message: "File size is too big"});
// resCode.set(1007, {code: "1007", message: "Update file failed"});
// resCode.set(1008, {code: "1008", message: "Maximum number of images"});
// resCode.set(1009, {code: "1009", message: "Not access"});
// resCode.set(1010, {code: "1010", message: "Action has been done previously by this user"});
// resCode.set(1011, {code: "1011", message: "Could not publish this post"});
// resCode.set(1012, {code: "1012", message: "Limited access"});
// resCode.set(9992, {code: "9992", message: "Post is not existed"});
// resCode.set(9993, {code: "9993", message: "Code verify is incorrect"});
// resCode.set(9994, {code: "9994", message: "No data or end of list data"});
// resCode.set(9995, {code: "9995", message: "User is not validated"});
// resCode.set(9996, {code: "9996", message: "User existed"});
// resCode.set(9997, {code: "9997", message: "Method is invalid"});
// resCode.set(9998, {code: "9998", message: "Token is invalid"});
// resCode.set(9999, {code: "9999", message: "Exception error"});
// resCode.set(401, {code: "401", message: "Not authorized, token failed"});
// resCode.set(402, {code: "402", message: "Not authorized, no token"});

// const response = (res, code) => {
//     if(resCode.has(code)) return res.json(resCode.get(code));
// }

const responseError = {
    OK: {
        statusCode: 200,
        body:  {
            code: "1000",
            message: "OK"
        }
    },
    CAN_NOT_CONNECT_TO_DB: {
        statusCode: 500,
        body: {
            code: "1001",
            message: "Can not connect to DB"
        }
    },
    PARAMETER_IS_NOT_ENOUGH: {
        statusCode: 400,
        body: {
            code: "1002",
            message: "Parameter is not enough"
        }
    },
    PARAMETER_TYPE_IS_INVALID: {
        statusCode: 400,
        body: {
            code: "1003",
            message: "Parameter type is invalid"
        }
    },
    PARAMETER_VALUE_IS_INVALID: {
        statusCode: 400,
        body: {
            code: "1004",
            message: "Parameter value is invalid"
        }
    },
    UNKNOWN_ERROR: {
        statusCode: 400,
        body: {
            code: "1005",
            message: "Unknown error"
        }
    },
    FILE_SIZE_IS_TOO_BIG: {
        statusCode: 400,
        body: {
            code: "1006",
            message: "File size is too big"
        }
    },
    UPLOAD_FILE_FAILED: {
        statusCode: 500,
        body: {
            code: "1007",
            message: "Upload file failed"
        }
    },
    MAXIMUM_NUMBER_OF_IMAGES: {
        statusCode: 400,
        body: {
            code: "1008",
            message: "Maximum number of images"
        }
    },
    NOT_ACCESS: {
        statusCode: 403,
        body: {
            code: "1009",
            message: "Not access"
        }
    },
    ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER: {
        statusCode: 400,
        body: {
            code: "1010",
            message: "Action has been done previously by this user"
        }
    },
    POST_IS_NOT_EXISTED: {
        statusCode: 400,
        body: {
            code: "9992",
            message: "Post is not existed"
        }
    },
    NO_DATA: {
        statusCode: 400,
        body: {
            code: "9994", message: "No data or end of list data"
        }
    },
    USER_EXISTED: {
        statusCode: 400,
        body: {
            code: "9996",
            message: "User existed"
        }
    },
    METHOD_IS_INVALID: {
        statusCode: 400,
        body: {
            code: "9997",
            message: "Method is invalid"
        }
    },
    EXCEPTION_ERROR: {
        statusCode: 400,
        body: {
            code: "9999",
            message: "Exception error"
        }
    },
    NOT_AUTHORIZED_TOKEN_FAILED: {
        statusCode: 400,
        body: {
            code: "401",
            message: "Not authorized, token failed"
        }
    },
    NOT_AUTHORIZED_NO_TOKEN: {
        statusCode: 400,
        body: {
            code: "402",
            message: "Not authorized, no token"
        }
    },
}

function setAndSendResponse(res, responseError) {
    return res.status(responseError.statusCode).send(responseError.body);
}

module.exports = {responseError, setAndSendResponse};
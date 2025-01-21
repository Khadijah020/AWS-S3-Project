const { constants } = require("../constants");

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    // Prepare a default response object
    const errorResponse = {
        message: err.message,
        stackTrace: process.env.NODE_ENV === "production" ? undefined : err.stack,
    };

    switch (statusCode) {
        case constants.BAD_REQUEST:
            res.json({title: "Validation Failed", 
                message: err.message,
                stackTrace: err.stack
            })
            break;
        case constants.FILE_NOT_FOUND:
            res.json({title: "Not Found", 
                message: err.message,
                stackTrace: err.stack
            })
            break;
        case constants.UNAUTHORIZED:
            res.json({title: "Unauthorized", 
                message: err.message,
                stackTrace: err.stack
            })
            break;
        case constants.FORBIDDEN:
            res.json({title: "Forbidden", 
                message: err.message,
                stackTrace: err.stack
            })
            break;
        case constants.INTERNAL_SERVER_ERROR:
            res.json({title: "SERVER ERROR", 
                message: err.message,
                stackTrace: err.stack
                    })
        default:
            console.log("No error, all good")
    }

    // Send the response only once
    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
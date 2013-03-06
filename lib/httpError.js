// Load modules

var Utils = require('./utils');

exports = module.exports;

/*
    HttpError(new Error)
    HttpError(code, message)
*/

function HttpError() {
    if(!(this instanceof HttpError))
        return new HttpError.apply(null,arguments);

    var self = this;

    Error.call(this);
    this.isError = true;

    this.response = {
        code: 0,
        payload: {},
        headers: {}
        // type: 'content-type'
    };

    if (arguments[0] instanceof Error) {

        // Error

        var error = arguments[0];

        this.data = error;
        this.response.code = error.code || 500;
        if (error.message) {
            this.message = error.message
        }
    }
    else {

        // code, message

        var code = parseInt(arguments[0],10);
        var message = arguments[1];

        /* Assertion seems superfluos */
        //Utils.assert(!isNaN(code) || code < 400, 'Invalid Error code: ' + code);

        this.response.code = code;
        if (message) {
            this.message = message
        }
    }

    // Response format

    this.reformat();

    return this;
};

Utils.inherit(HttpError, Error);


HttpError.prototype.reformat = function () {

    this.response.payload.code = this.response.code;
    this.response.payload.error = HttpError.STATUS_CODES[this.response.code] || 'Unknown';
    if (this.message) {
        this.response.payload.message = this.message;
    }
};


// Utilities

HttpError.badRequest = function (message) {

    return new HttpError(400, message);
};


HttpError.unauthorized = function (error, scheme, attributes) {           // Or function (error, wwwAuthenticate[])

    var err = new HttpError(401, error);

    if (!scheme) {
        return err;
    }

    var wwwAuthenticate = '';

    if (typeof scheme === 'string') {

        // function (error, scheme, attributes)

        wwwAuthenticate = scheme;
        if (attributes) {
            var names = Object.keys(attributes);
            for (var i = 0, il = names.length; i < il; ++i) {
                if (i) {
                    wwwAuthenticate += ',';
                }

                var value = attributes[names[i]];
                if (value === null ||
                    value === undefined) {              // Value can be zero

                    value = '';
                }
                wwwAuthenticate += ' ' + names[i] + '="' + Utils.escapeHeaderAttribute(value.toString()) + '"';
            }
        }

        if (error) {
            if (attributes) {
                wwwAuthenticate += ',';
            }
            wwwAuthenticate += ' error="' + Utils.escapeHeaderAttribute(error) + '"';
        }
        else {
            err.isMissing = true;
        }
    }
    else {

        // function (error, wwwAuthenticate[])

        var wwwArray = scheme;
        for (var i = 0, il = wwwArray.length; i < il; ++i) {
            if (i) {
                wwwAuthenticate += ', ';
            }

            wwwAuthenticate += wwwArray[i];
        }
    }

    err.response.headers['WWW-Authenticate'] = wwwAuthenticate;

    return err;
};


HttpError.clientTimeout = function (message) {

    return new HttpError(408, message);
};


HttpError.serverTimeout = function (message) {

    return new HttpError(503, message);
};


HttpError.forbidden = function (message) {

    return new HttpError(403, message);
};


HttpError.notFound = function (message) {

    return new HttpError(404, message);
};


HttpError.internal = function (message, data) {

    var err = new HttpError(500, message);
    err.data = data;
    err.response.payload.message = 'An internal server error occurred';                     // Hide actual error from user

    return err;
};


HttpError.passThrough = function (code, payload, contentType, headers) {

    var err = new HttpError(500, 'Pass-through');                                      // 500 code is only used to initialize

    err.data = {
        code: code,
        payload: payload,
        type: contentType
    };

    err.response.code = code;
    err.response.type = contentType;
    err.response.headers = headers;
    err.response.payload = payload;

    return err;
};

HttpError.STATUS_CODES = {
    "100": "Continue",
    "101": "Switching Protocols",
    "102": "Processing",
    "200": "OK",
    "201": "Created",
    "202": "Accepted",
    "203": "Non-Authoritative Information",
    "204": "No Content",
    "205": "Reset Content",
    "206": "Partial Content",
    "207": "Multi-Status",
    "208": "Already Reported",
    "226": "IM Used",
    "300": "Multiple Choices",
    "301": "Moved Permanently",
    "302": "Found",
    "303": "See Other",
    "304": "Not Modified",
    "305": "Use Proxy",
    "306": "Reserved",
    "307": "Temporary Redirect",
    "308": "Permanent Redirect",
    "400": "Bad Request",
    "401": "Unauthorized",
    "402": "Payment Required",
    "403": "Forbidden",
    "404": "Not Found",
    "405": "Method Not Allowed",
    "406": "Not Acceptable",
    "407": "Proxy Authentication Required",
    "408": "Request Timeout",
    "409": "Conflict",
    "410": "Gone",
    "411": "Length Required",
    "412": "Precondition Failed",
    "413": "Request Entity Too Large",
    "414": "Request-URI Too Long",
    "415": "Unsupported Media Type",
    "416": "Requested Range Not Satisfiable",
    "417": "Expectation Failed",
    "422": "Unprocessable Entity",
    "423": "Locked",
    "424": "Failed Dependency",
    "425": "Reserved for WebDAV advanced collections expired proposal",
    "426": "Upgrade Required",
    "427": "Unassigned",
    "428": "Precondition Required",
    "429": "Too Many Requests",
    "430": "Unassigned",
    "431": "Request Header Fields Too Large",
    "500": "Internal Server Error",
    "501": "Not Implemented",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
    "504": "Gateway Timeout",
    "505": "HTTP Version Not Supported",
    "506": "Variant Also Negotiates (Experimental)",
    "507": "Insufficient Storage",
    "508": "Loop Detected",
    "509": "Unassigned",
    "510": "Not Extended",
    "511": "Network Authentication Required"
};

exports = module.exports = HttpError;
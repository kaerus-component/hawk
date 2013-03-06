
exports = module.exports;

// Extract host and port from request

exports.parseHost = function (req, hostHeaderName) {

    hostHeaderName = (hostHeaderName ? hostHeaderName.toLowerCase() : 'host');
    var hostHeader = req.headers[hostHeaderName];
    if (!hostHeader) {
        return null;
    }

    var hostHeaderRegex = /^(?:(?:\r\n)?[\t ])*([^:]+)(?::(\d+))?(?:(?:\r\n)?[\t ])*$/;     // Does not support IPv6
    var hostParts = hostHeader.match(hostHeaderRegex);

    if (!hostParts ||
        hostParts.length !== 3 ||
        !hostParts[1]) {

        return null;
    }

    return {
        name: hostParts[1],
        port: (hostParts[2] ? hostParts[2] : (req.connection && req.connection.encrypted ? 443 : 80))
    };
};


// Convert node's  to request configuration object

exports.parseRequest = function (req, options) {

    if (!req.headers) {
        return req;
    }

    // Obtain host and port information

    var host = exports.parseHost(req, options.hostHeaderName);
    if (!host) {
        return new Error('Invalid Host header');
    }

    var req = {
        method: req.method,
        url: req.url,
        host: host.name,
        port: host.port,
        authorization: req.headers.authorization
    };

    return req;
};


exports.parseURL = function(str) {
    var url = /^(?:([A-Za-z]+):)(\/{0,3})(?:([^\x00-\x1F\x7F:]+)?:?([^\x00-\x1F\x7F:]*)@)?([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^\x00-\x1F\x7F]+))?$/,
        u = url.exec(str);
    if(!u) return false;
    var path = /^([\w\-]+)?(?:#([\w\-]+))?(?:\:([\w\-]+))?(?:\?(.*))?$/,
        p = u[7] ? path.exec(u[7]) : null;    
    return u ? {uriparts:u,
        protocol:u[1],
        username:u[3],
        password:u[4],
        hostname:u[5],
        port:u[6],
        path:p?{
            first:p[1],
            hash:p[2],
            base:p[3],
            query:p[4],
            string:u[7]
        }:u[7]} : false;   
}


exports.now = function () {

    return Date.now();
};


exports.inherit = function(self, parent) {
    self.super_ = parent;
    self.prototype = Object.create(parent.prototype, {
            constructor: {
                value: self,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
};


// Escape attribute value for use in HTTP header

exports.escapeHeaderAttribute = function (attribute) {

    return attribute.replace(/\\/g, '\\\\').replace(/\"/g, '\\"');
};

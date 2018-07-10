const jwt = require('jsonwebtoken');
const secret = process.env.APP_SECRET || 'superSecret';

module.exports = function (req, res, next) {
    // check header or url parameters or post parameters for token
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'failed to authenticate token'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).json({
            success: false,
            message: 'no token provided'
        });
    }
};
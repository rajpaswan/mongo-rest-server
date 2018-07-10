const router = require('express').Router();
const jwt = require('jsonwebtoken');
const sha512 = require('../utils/sha512');
const User = require('../models/user');

// get app secret
const secret = process.env.secret || 'superSecret';

// set root route
router.get('/', function (req, res) {
    res.json({
        register: `${req.protocol}://${req.get('host')}${req.originalUrl}${req.originalUrl.endsWith('/')?'':'/'}register`,
        authenticate: `${req.protocol}://${req.get('host')}${req.originalUrl}${req.originalUrl.endsWith('/')?'':'/'}authenticate`
    });
})

// registers a new user
router.post('/register', function (req, res) {
    let salt = sha512.salt(16);
    let digest = sha512.digest(req.body.password, salt);
    User.create({
            email: req.body.email,
            digest: digest,
            salt: salt,
            admin: req.body.admin
        },
        function (err, user) {
            if (err) {
                res.json({
                    success: false,
                    message: err.message
                });
            } else {
                res.json({
                    success: true,
                    message: 'user registration succesful'
                });
            }
        });
});

// authenticates an existing user
router.post('/authenticate', function (req, res) {
    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err) {
            res.json({
                success: false,
                message: err.message
            });
        } else if (!user) {
            res.json({
                success: false,
                message: 'user not found'
            });
        } else {
            let digest = sha512.digest(req.body.password, user.salt);
            if (digest === user.digest) {
                // generate token
                const payload = {
                    admin: user.admin
                };
                let token = jwt.sign(payload, secret, {
                    expiresIn: '1d'
                });
                res.json({
                    success: true,
                    message: 'user authentication successful',
                    token: token
                });
            } else {
                res.json({
                    success: false,
                    message: 'user authentication failed'
                });
            }
        }
    });
});

module.exports = router;
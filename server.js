const config = require('dotenv').config();
const db = require('./utils/db');
const logger = require('./utils/logger');
const tokenChecker = require('./utils/token-checker');
const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api-routes');
const dataRoutes = require('./routes/data-routes');

// setup app server
const app = express();
const port = process.env.APP_PORT || 3000;

// use body-parser middlewares
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// use logger middleware
app.use(function (req, res, next) {
    logger.info('[app]', req.method, req.path);
    next();
});

// set root route
app.get('/', function (req, res) {
    res.json({
        api: `${req.protocol}://${req.get('host')}${req.path}${req.path.endsWith('/')?'':'/'}api`,
        data: `${req.protocol}://${req.get('host')}${req.path}${req.path.endsWith('/')?'':'/'}data`
    });
});

// set api routes
app.use('/api', apiRoutes);

// set data routes
app.use('/data', tokenChecker, dataRoutes);

// start app server
app.listen(port, function () {
    logger.success(`[app] server running at http://localhost:${port}`);
});
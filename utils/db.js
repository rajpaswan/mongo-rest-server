const mongoose = require('mongoose');
const logger = require('./logger');

const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const mongoUrl = `mongodb://${host}:${port}`;

mongoose.connect(mongoUrl, function (err) {
    if (err)
        logger.error('[db]', err);
    else
        logger.success('[db] connected to', mongoUrl);
});
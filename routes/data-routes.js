const assert = require('assert');
const router = require('express').Router();
const mongo = require('mongodb');
const chalk = require('chalk');
const logger = require('../utils/logger');

/* load mongodb config */
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const mongoUrl = `mongodb://${host}:${port}`;

/* connect to mongodb */
let mongoClient = null;
mongo.MongoClient.connect(mongoUrl, function (err, client) {
    assert.equal(null, err);
    mongoClient = client;
    assert(mongoClient, null);
    logger.info('[data] connected to', mongoUrl);
});

/* define express routes */

// data level routes
router.all('/', function (req, res) {
    if (req.method === 'GET') {
        //logger.success(chalk.bold.black.bgGreen('GET'), 'data');
        let database = mongoClient.db('admin');
        let api = {};
        database.admin().listDatabases(function (err, dbs) {
            dbs = dbs.databases;
            for (db of dbs) {
                api[db.name] = `${req.protocol}://${req.get('host')}${req.originalUrl}${req.originalUrl.endsWith('/')?'':'/'}${db.name}`;
            }
            res.status(200).send(api);
        });
    } else {
        //logger.log(chalk.bold.black.bgWhite(req.method), 'data');
        //logger.verb(chalk.yellow(`${req.method} not supported at data level!`));
        res.status(400).send(`${req.method} not supported at data level!`);
    }
});

// db level routes
router.all('/:db', function (req, res) {
    if (req.method === 'GET') {
        //logger.success(chalk.bold.black.bgGreen('GET'), 'data', '/', req.params.db);
        try {
            let database = mongoClient.db(req.params.db);
            database.listCollections().toArray(function (err, result) {
                let api = {};
                for (col of result) {
                    api[col.name] = `${req.protocol}://${req.get('host')}${req.originalUrl}${req.originalUrl.endsWith('/')?'':'/'}${col.name}`;
                }
                res.status(200).send(api);
            });
        } catch (err) {
            //logger.verb(chalk.red(err.message));
            res.status(404).send(err.message);
        }
    } else {
        //logger.log(chalk.bold.black.bgWhite(req.method), req.params.db);
        //logger.verb(chalk.yellow(`${req.method} not supported at db level!`));
        res.status(400).send(`${req.method} not supported at db level!`);
    }
});

// collection level routes
router.all('/:db/:col', function (req, res) {
    if (req.method === 'GET') {
        //logger.success(chalk.bold.black.bgGreen('GET'), 'data', '/', req.params.db, '/', req.params.col, '?', JSON.stringify(req.query));
        if (req.params.col) {
            findDocuments(req.params.db, req.params.col, req.query, function (result) {
                res.send(result);
            });
        } else {
            //logger.verb(chalk.yellow('collection name is required!'));
            res.status(401).send('collection name is required!');
        }
    } else if (req.method === 'POST') {
        //logger.info(chalk.bold.black.bgCyanBright('POST'), 'data', '/', req.params.db, '/', req.params.col, '>', JSON.stringify(req.body));
        if (req.params.col) {
            if (JSON.stringify(req.body) != '{}') {
                insertDocument(req.params.db, req.params.col, req.body, function (result) {
                    res.status(201).send(result);
                });
            } else {
                //logger.verb(chalk.yellow('post body is empty!'));
                res.status(401).send('post body is empty!');
            }
        } else {
            //logger.verb(chalk.yellow('collection name is required!'));
            res.status(401).send('collection name is required!');
        }
    } else if (req.method === 'PATCH') {
        //logger.warn(chalk.bold.black.bgYellow('PATCH'), 'data', '/', req.params.db, '/', req.params.col, '?', JSON.stringify(req.query), '>', JSON.stringify(req.body));
        if (req.params.col) {
            if (JSON.stringify(req.query) != '{}') {
                if (JSON.stringify(req.body) != '{}') {
                    updateDocument(req.params.db, req.params.col, req.query, req.body, function (result) {
                        res.status(200).send(result);
                    });
                } else {
                    //logger.verb(chalk.yellow('patch body is empty!'));
                    res.status(401).send('patch body is empty!');
                }
            } else {
                //logger.verb(chalk.yellow('patch query is empty!'));
                res.status(401).send('patch query is empty!');
            }
        } else {
            //logger.verb(chalk.yellow('collection name is required!'));
            res.status(401).send('collection name is required!');
        }
    } else if (req.method === 'DELETE') {
        //logger.error(chalk.bold.black.bgRed('DELETE'), 'data', '/', req.params.db, '/', req.params.col, '?', JSON.stringify(req.query));
        if (req.params.col) {
            if (JSON.stringify(req.query) != '{}') {
                deleteDocument(req.params.db, req.params.col, req.query, function (result) {
                    res.status(200).send(result);
                });
            } else {
                //logger.verb(chalk.yellow('delete query is empty!'));
                res.status(401).send('delete query is empty!');
            }
        } else {
            //logger.verb(chalk.yellow('collection name is required!'));
            res.status(401).send('collection name is required!');
        }
    } else {
        //logger.log(chalk.bold.black.bgWhite(req.method), 'data', '/', req.params.db, '/', req.params.col);
        res.status(400).send(`${req.method} not supported at collection level!`);
    }
});

/* mongodb methods */

// get the database
let getDatabase = function (db) {
    let database = null;
    try {
        database = mongoClient.db(db);
    } catch (err) {
        //logger.verb(chalk.red(err.message));
    }
    return database;
}

// find one or more records
let findDocuments = function (db, col, query, callback) {
    let database = mongoClient.db(db);
    let collection = database.collection(col);
    collection.find(query).toArray(function (err, result) {
        assert.equal(err, null);
        //logger.verb(`found ${result.length} record(s)`);
        callback(result);
    });
}

// insert one record
let insertDocument = function (db, col, data, callback) {
    let database = mongoClient.db(db);
    let collection = database.collection(col);
    collection.insertOne(data, function (err, result) {
        assert.equal(err, null);
        //logger.verb(`inserted ${result.result.n} record(s)`);
        callback(result);
    });
}

// update one record
let updateDocument = function (db, col, query, data, callback) {
    let database = mongoClient.db(db);
    let collection = database.collection(col);
    collection.updateOne(query, {
        $set: data
    }, function (err, result) {
        assert.equal(err, null);
        //logger.verb(`updated ${result.result.n} record(s)`);
        callback(result);
    });
}

// delete one record
let deleteDocument = function (db, col, query, callback) {
    let database = mongoClient.db(db);
    let collection = database.collection(col);
    collection.deleteOne(query, function (err, result) {
        assert.equal(err, null);
        //logger.verb(`deleted ${result.result.n} record(s)`);
        callback(result);
    });
}

module.exports = router;
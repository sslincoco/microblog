var settings = require("../settings");
var Db = require("mongodb").Db;
var Connection = require("mongodb").connect;
var Server = require('mongodb').Server;
// var db = new Db(settings.db, new Server(settings.host, Connection.DEFAULT_PORT, {}));  
var db = new Db(settings.db, new Server(settings.host, settings.port, {}));  
module.exports = db;
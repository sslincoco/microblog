var mongodb = require('./db');
var crypto  = require('crypto');

function User(user) {
    this.name     = user.name;
    this.password = user.password;
};

module.exports = User;

// store user info
User.prototype.save = function(callback) {

    // save info document
    var user = {
        name: this.name,
        password: this.password
    };
    // opne datebase
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        // read user collection
        console.log('读取 users 集合');
        db.collection('users', function (err, collection) {

            if (err){
                mongodb.close();
                return callback(err);//err, return the err
            }
            // 为 name 属性添加索引
            collection.ensureIndex('name', {unique: true});

            // insert into collection
            collection.insert(user, {
                safe: true
            }, function (err, result) {
                mongodb.close();
                if (err){
                    return callback(err);
                }
                callback(null, result["ops"][0]);// success, return the saved user document
            })
        })
    });
};

// read info by name
User.get = function (name, callback) {
    // open db
    mongodb.open(function (err, db) {
       if (err){
           return callback(err);
       }
        db.collection('users', function (err, collection){
            if (err){
                db.close();
                return callback(err);
            }
            // find document by name
            collection.findOne({
                name: name
            }, function (err, user){
                mongodb.close();
                if (err){
                    return callback(err);// fail, return err
                }
                callback(null, user);// success, return result
            });
        });
    });
};
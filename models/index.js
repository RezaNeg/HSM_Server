"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";

// config.json is used by Sequelize to manage different environments.
var config    = require(path.join(__dirname, '../', 'config', 'config.json'))[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var db        = {};


// This file is used to import all the models we placed in the models folder, and export them.
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    // console.log("FILES:", file);
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    // console.log("this file:", file);
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
    
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

// setting table relations
// 1 to many relation
db.sequelize.models.product.hasMany(db.sequelize.models.order_line);
db.sequelize.models.order_line.belongsTo(db.sequelize.models.product);

// 1 to many relation
db.sequelize.models.category.hasMany(db.sequelize.models.product);
db.sequelize.models.product.belongsTo(db.sequelize.models.category);

// 1 to many relation
db.sequelize.models.order.hasMany(db.sequelize.models.order_line);
db.sequelize.models.order_line.belongsTo(db.sequelize.models.order);

// 1 to many relation
db.sequelize.models.user.hasMany(db.sequelize.models.auth_user);
db.sequelize.models.auth_user.belongsTo(db.sequelize.models.user);

// 1 to many relation
db.sequelize.models.provider.hasMany(db.sequelize.models.auth_user);
db.sequelize.models.auth_user.belongsTo(db.sequelize.models.provider);

// 1 to many relation
db.sequelize.models.user.hasMany(db.sequelize.models.order);
db.sequelize.models.order.belongsTo(db.sequelize.models.user);

// 1 to many relation
db.sequelize.models.shipping_method.hasMany(db.sequelize.models.order);
db.sequelize.models.order.belongsTo(db.sequelize.models.shipping_method);

// 1 to 1 relation
db.sequelize.models.payment.hasMany(db.sequelize.models.order);

// 1 to many relation 
// (each user has only one adderss and one address may be assigned to differnet users)
db.sequelize.models.address.hasMany(db.sequelize.models.user);
db.sequelize.models.user.belongsTo(db.sequelize.models.address);

// many to many relation for user and address as an option
// db.sequelize.models.user.belongsToMany(db.sequelize.models.address, {through: 'UserAddress'});
// db.sequelize.models.address.belongsToMany(db.sequelize.models.user, {through: 'UserAddress'});

module.exports = db;

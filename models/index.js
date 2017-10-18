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
db.sequelize.models.user.hasMany(db.sequelize.models.auth_user, { foreignKey: 'user_id' });
// db.sequelize.models.auth_user.belongsTo(db.sequelize.models.user, { foreignKey: 'user_id' });

db.sequelize.models.provider.hasMany(db.sequelize.models.auth_user, { foreignKey: 'provider_id' });
// db.sequelize.models.auth_user.belongsTo(db.sequelize.models.provider, { foreignKey: 'provider_id' });

db.sequelize.models.user.hasMany(db.sequelize.models.payment, { foreignKey: 'user_id' });
// db.sequelize.models.payment.belongsTo(db.sequelize.models.user, { foreignKey: 'user_id' });

db.sequelize.models.category.hasMany(db.sequelize.models.product, { foreignKey: 'cat_id' });
// db.sequelize.models.product.belongsTo(db.sequelize.models.category, { foreignKey: 'cat_id' });

db.sequelize.models.user.hasMany(db.sequelize.models.order, { foreignKey: 'user_id' });

db.sequelize.models.order.belongsToMany(db.sequelize.models.product, { through: db.sequelize.models.order_line });
db.sequelize.models.product.belongsToMany(db.sequelize.models.order, { through: db.sequelize.models.order_line });

db.sequelize.models.shipping_method.hasMany(db.sequelize.models.order, { foreignKey: 'shippingMethod_id' });

module.exports = db;

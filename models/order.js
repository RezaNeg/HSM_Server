module.exports = function(sequelize, Sequelize) {
	// Sequelize user model is initialized earlier as User
	var Order = sequelize.define('order', {
		id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
		total: { type: Sequelize.FLOAT},
		status: {type: Sequelize.ENUM("0", "1" ,"2" ,"4"),defaultValue: "0" }
	});

	return Order; 
}
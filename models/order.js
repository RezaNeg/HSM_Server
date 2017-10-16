module.exports = function(sequelize, Sequelize) {
	// Sequelize user model is initialized earlier as User
	var Order = sequelize.define('order', {
		id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
        total: { type: Sequelize.FLOAT},
	});

	return Order; 
}
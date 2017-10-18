module.exports = function(sequelize, Sequelize) {
	// Sequelize user model is initialized earlier as User
	var Order_line = sequelize.define('order_line', {
		id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
		quantity: { type: Sequelize.INTEGER },
        price: { type: Sequelize.FLOAT}
	});

	return Order_line; 
}
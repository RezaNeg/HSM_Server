module.exports = function(sequelize, Sequelize) {
	// Sequelize user model is initialized earlier as User
	var Order_detail = sequelize.define('order_detail', {
		quantity: { type: Sequelize.INTEGER },
        price: { type: Sequelize.FLOAT}
	});

	return Order_detail; 
}
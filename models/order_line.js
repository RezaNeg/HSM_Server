module.exports = function(sequelize, Sequelize) {
	// Sequelize user model is initialized earlier as User
	var Order_line = sequelize.define('order_line', {
		id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
		quantity: { type: Sequelize.INTEGER },
		price: { type: Sequelize.FLOAT},
		// productId: {
		// 	type: Sequelize.INTEGER,
		// 	references: {
		// 	  // This is a reference to another model
		// 	  model: 'Product',
		// 	  // This is the column name of the referenced model
		// 	  key: 'id',
		// 	}
		//   }
	});

	return Order_line; 
}
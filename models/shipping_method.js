module.exports = function(sequelize, Sequelize) {
	// Sequelize user model is initialized earlier as User
	var Shipping_method = sequelize.define('shipping_method', {
        id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
        name: { type: Sequelize.STRING },        
        desc: { type: Sequelize.STRING },
        price: { type: Sequelize.FLOAT}
	});

	return Shipping_method; 
}
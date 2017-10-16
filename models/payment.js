module.exports = function(sequelize, Sequelize) {
	var Payment = sequelize.define('payment', {
		id 			: 	{ type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
		amount   	: 	{ type: Sequelize.FLOAT},
		token   	: 	{ type: Sequelize.STRING(2000) },
		charge      : 	{ type: Sequelize.STRING(2000) }
	});

	return Payment; 
}

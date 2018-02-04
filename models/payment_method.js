module.exports = (sequelize, Sequelize) => {
	var Payment_method = sequelize.define('payment_method', {
		id      :   { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
		name    :   { type: Sequelize.STRING},
        image   :   { type: Sequelize.STRING},
        active	:	{ type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
	});

	return Payment_method; 
}

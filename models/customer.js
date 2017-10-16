module.exports = function(sequelize, Sequelize) {
	// Sequelize user model is initialized earlier as User
	var Customer = sequelize.define('customer', {
		id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
        firstname: { type: Sequelize.STRING},
        lastname: { type: Sequelize.STRING},
        address: { type: Sequelize.STRING},
        country: { type: Sequelize.STRING},
        zip: { type: Sequelize.STRING},
        phone: { type: Sequelize.STRING},
        _id: { type: Sequelize.STRING},
	});

	return Customer; 
}

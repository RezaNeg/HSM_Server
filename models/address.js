module.exports = function(sequelize, Sequelize) {
	// Sequelize user model is initialized earlier as User
	var Address = sequelize.define('address', {
		id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
        street: { type: Sequelize.STRING},
        city: { type: Sequelize.STRING},
        state: { type: Sequelize.STRING},
        country: { type: Sequelize.STRING},
        zip: { type: Sequelize.STRING}
	});

	return Address; 
}

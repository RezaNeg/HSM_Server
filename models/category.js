module.exports = function(sequelize, Sequelize) {
	// Sequelize user model is initialized earlier as User
	var Category = sequelize.define('category', {
		id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
		name: { type: Sequelize.STRING},
		image: { type: Sequelize.STRING},
	});

	return Category; 
}

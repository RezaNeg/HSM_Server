module.exports = function(sequelize, Sequelize) {
	// Sequelize user model is initialized earlier as User
	var Provider = sequelize.define('provider', {
		id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
		provider_name: { type: Sequelize.STRING}
	});

	return Provider;
}


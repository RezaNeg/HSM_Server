// function ord(sequelize, DataTypes) {
//     return sequelize.define('ord',
//         {
//             user: {
//                 type: DataTypes.JSON
//             },
//             total: {
//                 type: DataTypes.NUMBER,
//                 reqired: true
//             }
//         },
//         {
//             freezeTableName: true,
//             classMethods: {}
//         }
//     );
// }




// const OrderSchema = new Schema({
//     total: Number,
//     customer: { type: Schema.Types.ObjectId, ref: 'Customer' }, // TODO: remove property
//     user: { type: Schema.Types.ObjectId, ref: 'User' },
//     status: Number,
//     shipping: {
//       value: { type: Schema.Types.ObjectId, ref: 'Shipping' },
//       trackingNumber: String,
//       price: Number,
//       weight: Number,
//     },
//     items: [{
//       quantity: Number,
//       price: Number,
//       variant: {
//         type: Schema.ObjectId,
//         ref: 'Variant',
//       },
//     }],
//     payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
//     statusLog: [{
//       status: Number,
//       createdAt: { type: Date, default: Date.now },
//     }],
//     shippingAddress: {
//       email: { type: String, default: '' },
//       phone: { type: String, default: '' },
//       city: { type: String, default: '' },
//       firstname: { type: String, default: '' },
//       lastname: { type: String, default: '' },
//       postnumber: { type: String, default: '' },
//       address: { type: String, default: '' },
//       country: { type: String, default: '' },
//     },
//     thread: {
//       type: Schema.Types.ObjectId,
//       ref: 'Thread',
//     },
//   }, {
//     timestamps: true,
//   });
  
// module.exports = function(sequelize, Sequelize) {
// 	const Ord = sequelize.define('ord', {
// 		id 			: 		{ type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
// 		admin		:		{ type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
// 		firstname	: 		{ type: Sequelize.STRING },
// 		lastname	: 		{ type: Sequelize.STRING },
// 		email 		: 		{ type: Sequelize.STRING, validate: {isEmail:true} },
// 		password 	: 		{ type: Sequelize.STRING }, 
// 		password_salt: 		{ type: Sequelize.STRING },
// 		f_id		:   	{ type: Sequelize.STRING },
// 		f_name 		:   	{ type: Sequelize.STRING },
// 		g_id		:   	{ type: Sequelize.STRING },
// 		g_name 		:   	{ type: Sequelize.STRING },
// 		l_id		:   	{ type: Sequelize.STRING },
// 		l_name 		:   	{ type: Sequelize.STRING },
// 		t_id		:   	{ type: Sequelize.STRING },
// 		t_name 		:   	{ type: Sequelize.STRING },
// 		imageURL 	: 		{ type: Sequelize.STRING },
// 		last_login	: 		{ type: Sequelize.DATE },
//         status 		: 		{ type: Sequelize.ENUM('active','inactive'),defaultValue:'active' }
// 	});

// 	return User;
// }
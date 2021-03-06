const bCrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const stripe = require('stripe')(config.stripeKey);
const Sequelize = require('sequelize');


module.exports = (app,
                  user, 
                  auth_user, 
                  product, 
                  payment, 
                  category, 
                  customer,
                  order,
                  order_line,
                  shipping_method,
                  address,
                  payment_method
                ) => {
	const User = user;
  const Auth_user = auth_user;
  const Product = product;
  const Payment = payment;
  const Category = category;
  const Customer = customer; 
  const Order = order;
  const Order_line = order_line;
  const Shipping_method = shipping_method;
  const Address = address;
  const Payment_method = payment_method

  // login section
  app.post('/users/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
		User.findOne({ where : { email: email}}).then((user) => {
      if (!user) {
        req.msg = "No such a user!";
        return res.json({success: false, msg:req.msg});
      } else if (!user.password){
        req.msg = "You registered only via social networks! Signup locally!";
        return res.json({success: false, msg:req.msg});
      }else if (!isCorrectPassword(password, user.password)) {
        req.msg = "Incorrect password!";
        return res.json({success: false, msg:req.msg});
      }else{
        sendUserToClient(user.get(),"You are successfully logged in.", res);
        }
      }).catch((err) => {
			  console.log("###### Error : ", err);												
    });
  });

  // signup section
	app.post("/users/signup", (req, res) => {
		// I dont check for passwords mismatch error as I did it in client side
		const password_salt = bCrypt.genSaltSync(9);
    const userPassword  = bCrypt.hashSync(req.body.password, password_salt, null);
    const data = {
                email 		    : req.body.email,
                password    	: userPassword,
                password_salt : password_salt,
                firstname    	: req.body.firstname,
                lastname 	    : req.body.lastname    
                };
    User.findOne({where: {email:req.body.email}}).then((user) => {
			if(user && user.password != null) {
				return res.json({success: false, msg:'That email is already taken!'});
			}else if (user && user.password == null) {
        // we are updating a user who has been logged in earlier only from social networks
        return User.update(data, { where: { email: data.email} }).then(() => {
          return res.json({success: true, msg:'User information is updated successfully.'});
        }).catch((err) => {
          return res.json({success: false, msg:'Something went wrong while updating user information!'});
        });
      }else{ // we must register new user
        return User.create(data).then((newUser,created) => {
          if(!newUser){
            return res.json({success: false, msg:'Failed to register user due to db error!'});
          }else{
            return res.json({success: true, msg:'User is registered successfully.'});
          }
          }).catch((err) => {
            return res.json({success: false, msg:'Something went wrong while registering new user!'});
          });
      }
    });
  });


  // facebook section
	app.post("/users/auth/facebook", (req, res) => {
    console.log("@@@@@@@@@@@ searching for f_id in user");
    console.log(req.body.id);
    User.findOne({ where : { f_id: req.body.id }}).then((user) => {
      if(user){
        console.log("@@@@@@@@@@@ executing user.get");
        const userInfo = user.get();
        const token = jwt.sign(userInfo, config.secret, {
          expiresIn: 300
        });
        req.msg = "You are successfully logged in using Facebook (as before)!";
        return res.json({ success: true,
                          msg:req.msg,
                          token: 'JWT '+ token,
                          user:{
                            id: userInfo.id,
                            f_id: userInfo.f_id,
                            firstname: userInfo.firstname,
                            lastname: userInfo.lastname,
                            email: userInfo.email
                          }
                        });
      }else{
        console.log("@@@@@@@@@@@ searching for facebook email in user table");
        return User.findOne({ where : { email : req.body.email } }).then((user) => {
          if(user){
            const dataForAuth_user =
            { 
              userId  	: user.id,
              auth_id 	: req.body.id,
              email     : req.body.email,
              firstname : req.body.first_name,
              lastname 	: req.body.last_name,
              displayName : req.body.name,
              providerId : 1
            };
            const data = {
              f_id 	: req.body.id,
              f_name 	: req.body.name
            };
            console.log("@@@@@@@@@@@ searching for f_id in auth_user table");
            return Auth_user.findOne({ where : { auth_id : req.body.id }}).then((auth_user) => {
              if(auth_user){
                console.log("@@@@@@@@@@@ Updating Auth_table with new data from facebook");
                return Auth_user.update(dataForAuth_user, { where: { auth_id : req.body.id } }).then(() => {
                  console.log("@@@@@@@@@@@ updating user table by inserting f_id and f_name");
                  return User.update(data, { where: { email : req.body.email } }).then(() => {
                    console.log("@@@@@@@@@@@ executing user.get");
                    const userInfo = user.get();
                    const token = jwt.sign(userInfo, config.secret, {
                      expiresIn: 300
                    });
                    req.msg = "You are successfully logged in using Facebook. (new Facebook relogin)";
                    return res.json({ success: true,
                                      msg:req.msg,
                                      token: 'JWT '+ token,
                                      user:{
                                        id: userInfo.id,
                                        f_id: userInfo.f_id,
                                        firstname: userInfo.firstname,
                                        lastname: userInfo.lastname,
                                        email: userInfo.email
                                      }
                                    });
                  });
                });
              }else{
                console.log("@@@@@@@@@@@ No f_id and creating new facebook user in auth-user table");
                return Auth_user.create(dataForAuth_user).then((newAuthUser,created) => {
                  if(!newAuthUser){
                    return res.json({success: false, msg:'Problem in registering your Facebook profile!'});
                  }else{
                    console.log("A new facebook user is created!");
                    console.log("@@@@@@@@@@@ updating user table by inserting f_id and f_name");
                    return User.update(data, { where: { email : req.body.email } }).then(() => {
                      console.log("@@@@@@@@@@@ executing user.get");
                      const userInfo = user.get();
                      const token = jwt.sign(userInfo, config.secret, {
                        expiresIn: 300
                      });
                      req.msg = "You are successfully logged in using Facebook. (first Facebook login)";
                      return res.json({ success: true,
                                        msg:req.msg,
                                        token: 'JWT '+ token,
                                        user:{
                                          id: userInfo.id,
                                          f_id: userInfo.f_id,
                                          firstname: userInfo.firstname,
                                          lastname: userInfo.lastname,
                                          email: userInfo.email
                                        }
                                      });
                    });
                  }
                });
              }
            });
          }else{
            // no user with Facebook email exists in our database
            const dataForUser =
            { 
              firstname 	: req.body.first_name,
              lastname 	  : req.body.last_name,
              f_id 		    : req.body.id,
              f_name 	  	: req.body.name,
              email 		  : req.body.email
            };
            console.log("@@@@@@@@@@@ creating a new user based on facebook profile");
            return User.create(dataForUser).then((newUser,created) => {
              if(!newUser){
                return res.json({success: false, msg:'Problem in creating your local profile based on facebook data!'});
              }else{
              const dataForAuth_user =
                {
                  userId  	  : newUser.id,
                  auth_id 	  : req.body.id,
                  firstname   : req.body.first_name,
                  lastname 	  : req.body.last_name,
                  displayName : req.body.name,
                  email       : req.body.email,
                  providerId : 1
                };
                console.log("@@@@@@@@@@@ creating a new facebook profile");
                return Auth_user.create(dataForAuth_user).then((newAuthUser,created) => {
                  if(!newAuthUser){
                    return res.json({success: false, msg:'Problem in registering your new Facebook profile!'});
                  }else{
                    console.log("NEW USER: ", newUser);
                    const userInfo = newUser.get();
                    console.log("STRINGIFIED NEW USER: ", userInfo)
                    const token = jwt.sign(userInfo, config.secret, {
                      expiresIn: 300
                    });
                    req.msg = "You are successfully logged in using Facebook. (first login ever)";
                    return res.json({ success: true,
                                      msg:req.msg,
                                      token: 'JWT '+ token,
                                      user:{
                                        id: userInfo.id,
                                        f_id: userInfo.f_id,
                                        firstname: userInfo.firstname,
                                        lastname: userInfo.lastname,
                                        email: userInfo.email
                                      }
                                    });
                  }
                });
                }
            });
          }
        });	
      }
    });
  });


  // all social logins together (facebook, google and linkedin)
  app.post("/users/auth/social", (req, res) => {
    console.log("Request body from client: ", req.body);
    // data initiation
    console.log("START OF SOCIAL LOGIN AT SERVER SIDE: ..........");
    var socialId = req.body.uid;
    var prodiverId = null;
    var updUser = null;
    var split = req.body.name.split(' ');
    var dataForUser = {
                        firstname 	: split[0],
                        lastname 	  : split[split.length -1],
                        email 		  : req.body.email,
                        imageURL    : req.body.image
                      };
    var dataForAuth_user = {
                              auth_id 	  : socialId,
                              firstname   : split[0],
                              lastname 	  : split[split.length -1],
                              displayName : req.body.name,
                              email       : req.body.email,
                              imageURL    : req.body.image
                            }; 
    console.log("req.body.provider: ", req.body.provider);
    switch (req.body.provider){
      case 'facebook':
        prodiverId = "1";
        updUser =  {
                    f_id 	: socialId,
                    f_name 	: req.body.name,
                    imageURL: req.body.image
                  };
        dataForUser.f_id = socialId;
        dataForUser.f_name = req.body.name;
        break;
      case 'google':
        prodiverId = "2";
        updUser =  {
                    g_id 	: socialId,
                    g_name 	: req.body.name,
                    imageURL: req.body.image
                  };               
        dataForUser.g_id = socialId;
        dataForUser.g_name = req.body.name;
        break;
      case 'linkedIN':
        prodiverId = "3";
        updUser =  {
                    l_id 	: socialId,
                    l_name 	: req.body.name,
                    imageURL: req.body.image
                  };
        dataForUser.l_id = socialId;
        dataForUser.l_name = req.body.name;
        break;
    }
    dataForAuth_user.providerId = prodiverId;
    
    // profile manipulation
    console.log("@@@@@@@@@@@ searching for f_id, g-id or t-id in user table");

    User.findOne({ where: { $or: [ { f_id: socialId }, { g_id: socialId}, { l_id: socialId } ] } }).then((user) => {
      if(user){
        console.log("@@@@@@@@@@@ executing user.get");
        sendUserToClient(user.get(), "You are successfully logged in using social netwowrks (as before)!", res);
      }else{
        console.log("@@@@@@@@@@@ searching for social network email in user table");
        return User.findOne({ where : { email : req.body.email } }).then((user) => {
          if(user){
            dataForAuth_user.userId = user.id;
            console.log("@@@@@@@@@@@ searching for auth_id in auth_user table");
            return Auth_user.findOne({ where : { auth_id: socialId } }).then((auth_user) => {
              if(auth_user){
                console.log("@@@@@@@@@@@ Updating Auth_table with new data from social network");
                return Auth_user.update(dataForAuth_user, { where: { auth_id : socialId } }).then(() => {
                  console.log("@@@@@@@@@@@ updating user table by inserting social data");
                  return User.update(updUser, { where: { email : req.body.email } }).then(() => {
                    User.findOne({ where : { email : req.body.email }}).then((user) => {
                      sendUserToClient(user.get(), "Welcome back! You are successfully logged in using social networks!", res);
                    });
                  });
                });
              }else{
                console.log("@@@@@@@@@@@ No auth_id and creating new authUser in auth-user table");
                return Auth_user.create(dataForAuth_user).then((newAuthUser,created) => {
                  if(!newAuthUser){
                    return res.json({success: false, msg:'Problem in registering your social network profile!'});
                  }else{
                    console.log("A new authUser is created!");
                    console.log("@@@@@@@@@@@ updating user table by inserting social data");
                    return User.update(updUser, { where: { email : req.body.email } }).then(() => {
                      User.findOne({ where : { email : req.body.email }}).then((user) =>{
                        sendUserToClient(user.get(), "You are successfully logged in using social networks.", res);
                      });
                    });
                  }
                });
              }
            });
          }else{
            // no user with this social network email exists in our database
            console.log("@@@@@@@@@@@ creating a new user based on social network data");
            return User.create(dataForUser).then((newUser,created) => {
              if(!newUser){
                return res.json({success: false, msg:'Problem in creating your local profile based on social network data!'});
              }else{
                dataForAuth_user.userId = newUser.id;
                console.log("@@@@@@@@@@@ creating a new authUser in auth table");
                return Auth_user.create(dataForAuth_user).then((newAuthUser,created) => {
                  if(!newAuthUser){
                    return res.json({success: false, msg:'Problem in registering your new social network in our database!'});
                  }else{
                    sendUserToClient(newUser.get(), "You are successfully logged in using social networks. (first login ever)", res);
                  }
                });
                }
            });
          }
        });	
      }
    });
  });

function sendUserToClient(user, msg, res){
  const token = jwt.sign(user, config.secret, {
    expiresIn: 300  
  });
  user.password = null;
  user.password_salt = null;
  return res.json({ success: true,
                    msg: msg,
                    token: 'JWT '+ token,
                    user: user
                  });
}

 // profile section
	app.get('/users/profile', (req, res, next) => {
    console.log("Header authorization from client: ", req.headers.authorization);
    let str = req.headers.authorization;
    jwt.verify(str.substring(4), config.secret, (err, user) => {
      if(!err){
        console.log("decoded user: ", user);
        //check it..........TODO.............. YOU better send only what is required not all of the user info backto client
        return res.json({user: user, msg: "You made it to the secure area"});
      }else{ return res.json({msg: "Your token is expired!"});}
    });
  
  });



  app.get('/product-detail/:id', (req,res,next) => {
    console.log("REQ>PARAM: ", req.params.id );
    Product.findOne({where: {id: req.params.id}}).then((product) => {
      if (!product){
        req.msg = "No such a product in database!";
        return res.json({success: false, msg:req.msg});
      }else{
        sendProductToClient(product, "the product is found.", res);
      }
    }).catch((err) => {
			  console.log("###### Error : ", err);
    });
  })

  app.get('/products', (req,res,next) => {
    // console.log("REQ from client: ", req);

    Product.findAll().then((product) => {
      if (!product) {
        req.msg = "No product in database!";
        return res.json({success: false, msg:req.msg});
      }else{
        sendProductsToClient(product,"products are loaded successfully.", res);
        }
      }).catch((err) => {
			  console.log("###### Error : ", err);												
    });
  })

  // payment data entry
	app.post("/payments", (req, res) => {
    console.log("payment data from client: ", req.body);
    const payment = {
                token 		    : req.body.token,
                amount    	  : req.body.amount,
                userId 	    : req.body.userId    
                };
    // testing charges!
    const charge2 = stripe.charges.create({
      amount: req.body.amount,
      currency: "cad",
      description: "Example charge",
      // source: "test"
      source: req.body.token
    }, (err, charge) => {  
      console.log("Entered ChargeCreate Callback Function!");       
        if (err && err.type === 'StripeCardError') {
          console.log("ERRORRRRRRRRRRRR: ", err);
        }
        if(err){
          console.log("CHARGE is NULL!", err);
        } 
      console.log("CHARGE: ", charge);
      return Payment.create(payment).then((newPayment, created) => {
        if(!newPayment){
          return res.json({success: false, msg: 'Failed to add new payment to the database!'});
        }else{
          return res.json({success: true, msg: 'The new payment is added to the database!'});
        }
      }).catch((err) => {
        return res.json({success: false, msg:'Something went wrong while registering the payment in the database!'});
      });
    });
    
  });

  
  // category section
  app.get('/category', (req,res,next) => {
    // console.log("CAT REQ from client: ", req);

    Category.findAll().then((category) => {
      if (!category) {
        req.msg = "No category in database!";
        return res.json({success: false, msg:req.msg});
      }else{
        sendCategoriesToClient(category, "Categories are loaded successfully.", res);
        }
      }).catch((err) => {
			  console.log("###### Error : ", err);												
    });
  })

// TODO this part has changed product-details output (I did this becuase of category adding!!!!!)
  app.get('/category/:id', (req,res,next) => {
    console.log("REQ>PARAM: ", req.params.id );

    Product.findAll({
      where: {categoryId: req.params.id},
      include: [ {model: Category}]
      }).then((product) => {
        if (!product){
          req.msg = "No such a category in database!";
          return res.json({success: false, msg:req.msg});
        }else{
          console.log("selected category list: ", JSON.stringify(product));
          sendCategoryToClient(product, "the product is found.", res);
        }
      }).catch((err) => {
			  console.log("###### Error : ", err);
    });
  })


      // shipping method section
  app.get('/shipping-method', (req,res,next) => {
    // console.log("SHIP METHOD REQ from client: ", req.body);

    Shipping_method.findAll().then((shipping_methods) => {
      if (!shipping_methods) {
        req.msg = "No category in database!";
        return res.json({success: false, msg:req.msg});
      }else{
        sendShippingMethodsToClient(shipping_methods, "Categories are loaded successfully.", res);
        }
      }).catch((err) => {
			  console.log("###### Error : ", err);												
    });
  })


  app.get('/shipping-method/:id', (req,res,next) => {
    console.log("REQ>PARAM: ", req.params.id );
    Shipping_method.findOne({where: {id: req.params.id}}).then((shipping_method) => {
      if (!shipping_method){
        req.msg = "No such a category in database!";
        return res.json({success: false, msg:req.msg});
      }else{
        sendShippingMethodToClient(shipping_method, "the product is found.", res);
      }
    }).catch((err) => {
			  console.log("###### Error : ", err);
    });
  })

      // payment method section
      app.get('/payment-methods', (req,res,next) => {
        // console.log("Payment METHOD REQ from client: ", req.body);
        Payment_method.findAll().then((payment_methods) => {
          if (!payment_methods) {
            return res.json({
              success: false,
              msg:"No payment method found in database!"
            });
          }else{
            console.log("payment method extracted in server: ", payment_methods);
            return res.json({
              success: true,
              msg: "payment methods load successfully!",
              payment_methods: payment_methods
            });
            }
          }).catch((err) => {
            console.log("###### Error : ", err);												
        });
      })


  // Address section
  app.post('/address', (req, res) => {
    console.log("Address form CLIENT: ", req.body);
    Address.findOne({where: {id: req.body.id}}).then((address) =>{
      if (!address){
        return Address.create(req.body).then((newAddress,created) => {
          if(!newAddress){
            return res.json({success: false, msg:'Failed to register address due to db error!'});
          }else{
            return res.status(200).json(newAddress.get());
            // return res.json({success: true, msg:'Address is registered successfully.'}, newAddress.get());
          }
          }).catch((err) => {
            return res.status(500).json({msg:'Something went wrong while registering new address!'});
            // return res.json({success: false, msg:'Something went wrong while registering new address!'});
          });
      }else{
        return Address.update(req.body, {where: {id: req.body.id}}).then(() => {
          return res.json({success: true, address: req.body, msg:'address updated!'});
        }).catch((err) => {
          return res.json({success: false, msg:'Something went wrong while updating user address!'});
        })
      }
    }).catch();

  });

  // Get specifique address
  app.get('/address/:id', (req,res,next) => {
    console.log("REQ>PARAM: ", req.params.id );
    Address.findOne({where: {id: req.params.id}}).then((address) => {
      if (!address){
        req.msg = "No such a address in database!";
        return res.json({success: false, msg:req.msg});
      }else{
        console.log("address from server: ", address.dataValues);
        sendAddressToClient(address, "the address is found.", res);
      }
    }).catch((err) => {
			  console.log("###### Error : ", err);
    });
  })


  // update user section
	app.put("/users", (req, res) => {
    const data = req.body;
    console.log("user data update from client:              ", req.body);
    User.update(
      { addressId: req.body.addressId },
      { where: { email: req.body.email }}
    ).then (() => {
      return res.json({success: true, msg:'User information is updated successfully.'});
    }).catch((err) => {
      return res.json({success: false, msg:'Something went wrong while updating user information!'});
    })
  });


    // order section
    app.post('/order', (req, res) => {
      console.log("ORDER form CLIENT: ", req.body);
      return Order.create(req.body).then((newOrder,created) => {
        if(!newOrder){
          return res.json({success: false, msg:'Failed to register order due to db error!'});
        }else{
          console.log("new registered ORDER: ", newOrder);
          return res.json({success: true, order: newOrder, msg:'Order is registered successfully.'});
        }
        }).catch((err) => {
          return res.json({success: false, msg:'Something went wrong while registering new order!'});
        });
    });


  app.get('/order/:id', (req,res,next) => {
    console.log("REQ>PARAM: ", req.params.id );
    Order.findOne({
      where: {id: req.params.id},
      // include: [ {model: User,
      //   include: [ {model: Payment_method}]},
      // ]
      include: [ {all: true, nested: true}]
    }).then((order) => {
      if (!order){
        req.msg = "No such a category in database!";
        return res.json({success: false, msg:req.msg});
      }else{
        sendOrderToClient(order, "the product is found.", res);
      }
    }).catch((err) => {
        console.log("###### Error : ", err);
    });
  })






  app.get('/order-items/:id', (req,res,next) => {
    console.log("REQ>PARAM: ", req.params.id );
    Order_line.findAll({
      where: {orderId: req.params.id},
      include: [ {model: Product
      }]
      }).then((order_items) => {
      console.log("order_items with product:  " ,JSON.stringify(order_items));
      sendOrderItemsToClient(order_items, "the items are found!", res);
      })
    }) 





  app.get('/orders/:id', (req,res,next) => {
    console.log("REQ>PARAM: ", req.params.id );
    Order.findAll({where: {userId: req.params.id}}).then((orders) => {
      if (!orders){
        req.msg = "No order for the current user in database!";
        return res.json({success: false, msg:req.msg});
      }else{
        console.log("List of Orders by the current User: ", JSON.stringify(orders));
        sendOrdersToClient(orders, "the orders are found!", res);
      }
    }).catch((err) => {
			  console.log("###### Error : ", err);
    });
  })
  

  app.post('/order-items/:id', (req, res, next) => {
    console.log("ORDER items form CLIENT: ", req.body);
    console.log("REQ>PARAM (order number): ", req.params.id );
    return Order_line.create(req.body).then((newOrderLine,created) => {
      if(!newOrderLine){
        return res.json({success: false, msg:'Failed to register order line due to db error!'});
      }else{
        return res.json({success: true, item: newOrderLine, msg:'Order is registered successfully.'});
      }
      }).catch((err) => {
        return res.json({success: false, msg:'Something went wrong while registering new order line!'});
      });
  });



  // app.get('/order-items/:id', function(req,res,next){
  //   console.log("REQ>PARAM: ", req.params.id );
  //   Order_line.findAll({where: {orderId: req.params.id}}).then((order_items) => {
  //     if (!order_items){
  //       req.msg = "No item for the current order in database!";
  //       return res.json({success: false, msg:req.msg});
  //     }else{
  //       console.log("List of items in this order: ", JSON.stringify(order_items));
  //       sendOrderItemsToClient(order_items, "the items are found!", res);
  //     }
  //   }).catch(function(err){
	// 		  console.log("###### Error : ", err);
  //   });
  // })
    
  //inner join test! order line is nested in product array:
  app.get('/order-items/:id', (req,res,next) => {
    console.log("REQ>PARAM: ", req.params.id );
    Order_line.findAll({
      where: {orderId: req.params.id},
      include: [{model: Product }]
      }).then((order_items) => {
      console.log("order_items with product:  " ,JSON.stringify(order_items));
      sendOrderItemsToClient(order_items, "the items are found!", res);
      })
    }) 


    // including user, order, orderline and products all together
    // app.get('/order-items/:id', function(req,res,next){
    //   console.log("REQ>PARAM: ", req.params.id );
    //   User.findAll({
    //     include: [ {model: Order, include:[
    //       {model: Order_line , where: {orderId: req.params.id} ,  include:[
    //         {model: Product}
    //         ]}
    //       ]
    //     }]
    //     }).then(order_items=>{
    //     console.log("order_items with product:  " ,JSON.stringify(order_items));
    //     sendOrderItemsToClient(order_items, "the items are found!", res);
    //     })
    //   })  

    //search section
    

    app.get('/product', (req,res,next) => {
      // console.log("REQ>SEARCH for .query: ", req.query, " body", req.body );
      // console.log("REQ: ", req );
      console.log("REQ.query: ", req.query );
      // console.log("REQ.search: ", req.search );
      console.log("limit: ", req.query.limit);
      Product.findAll({
        where: [{desc: {$like: '%'+req.query.query+'%'}}],
        include: [{model: Category }],
        limit: parseInt(req.query.limit),
        subQuery:false
      }).then((products) => {
        if (products.length == 0){
          req.msg = "No products with the search criteria!";
          return res.json({success: false, msg:req.msg});
        }else{
          // console.log("PROD search : ", products);
          console.log("List of porducts: ", JSON.stringify(products));
          sendProductsToClient(products, "the products are found!", res);
        }
      }).catch((err) => {
          console.log("###### Error : ", err);
      });
    })
      



function sendProductToClient(product, msg, res){
  return res.json({ success: true,
                    msg: msg,
                    product: product
                  });
}


function sendProductsToClient(products, msg, res){
  return res.json({ success: true,
                    msg: msg,
                    products: products
                  });
}

function sendCategoryToClient(category, msg, res){
  return res.json({ success: true,
                    msg: msg,
                    category: category
                  });
}


function sendCategoriesToClient(categories, msg, res){
  return res.json({ success: true,
                    msg: msg,
                    categories: categories
                  });
}


function sendOrderToClient(order, msg, res){
  return res.json({ success: true,
                    msg: msg,
                    order: order
                  });
}

function sendOrdersToClient(orders, msg, res){
  return res.json({ success: true,
                    msg: msg,
                    orders: orders
                  });
}


function sendOrderItemsToClient(items, msg, res){
  return res.json({ success: true,
                    msg: msg,
                    items: items
                  });
}

function sendShippingMethodToClient(shipping_method, msg, res){
  return res.json({ success: true,
                    msg: msg,
                    shipping_method: shipping_method
                  });
}


function sendShippingMethodsToClient(shipping_methods, msg, res){
  return res.json({ success: true,
                    msg: msg,
                    shipping_methods: shipping_methods
                  });
}

function sendAddressToClient(address, msg, res){
  return res.json({ success: true,
                    msg: msg,
                    address: address
                  });
}

function isCorrectPassword(userpass,password){
  return bCrypt.compareSync(userpass, password);
}

};


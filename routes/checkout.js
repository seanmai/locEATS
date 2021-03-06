var express = require("express");
var app = require('../app');
var router = express.Router();
var Food = require("../models/food");
var Cart = require("../models/cart");
var Order = require("../models/order");
var middleware = require("../middleware");

router.get("/add-to-cart/:id", function(req, res){
    var foodId = req.params.id;
    // If there was already a created cart then pass it, otherwise pass in empty object for new cart
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    Food.findById(foodId, function(err, food){
        if(err){
            console.log(err);
            return res.redirect("/menu");
        }
        cart.add(food, food.id);
        req.session.cart = cart;
        // console.log(req.session.cart);
        res.redirect("/menu");
    });
});

router.get("/cart-reduce-one/:id", function(req, res){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    var quantity = req.body.qty;
    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect("/checkout");
});

router.get("/cart-increase-one/:id", function(req, res){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    var quantity = req.body.qty;
    cart.increaseByOne(productId);
    req.session.cart = cart;
    res.redirect("/checkout");
});

router.get("/cart-remove/:id", function(req, res){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect("/checkout");
});

router.get("/", function(req, res){
    if(!req.session.cart){
        return res.render("menu/checkout", {foods: null});
    }
    var cart = new Cart(req.session.cart);
    res.render("menu/checkout", {foods: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.post("/", function(req, res){
    if(!req.session.cart){
        return res.redirect("/checkout");
    }
    var cart = new Cart(req.session.cart);
    // cart.totalPrice *= 1.05;
    if(!req.user){
        var user = {};
    } else {
        var user = {
            id: req.user._id,
            username: req.user.username
        };
    }

    var order = new Order({
        user: user,
        name: req.body.name,
        phone: req.body.phone,
        cart: cart,
        lat: req.body.lat,
        lng: req.body.lng,
        deliveryTime: Date.now(),
        payment: req.body.paymentOption,
        instructions: req.body.note
    });

    Order.create(order, function(err, order){
        if(err){
            req.flash("error", err.message);
            return res.redirect("back");
        }
        if(req.user){
            order.save();
            req.user.orders.push(order);
            req.user.save();
        }
        var io = req.app.get("socketio"); // Retrieves app.set("socketio", io)
        io.sockets.emit("order", order);  // Emits data recieved to all open sockets on "order"
        // console.log(order);
        req.session.cart = {};
        req.flash("success", "Sit tight, your order is on the way!");
        res.redirect("/")
    })
});

module.exports = router;

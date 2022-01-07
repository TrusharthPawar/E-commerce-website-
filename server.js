const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const port = process.env.PORT || 3000;
const bodyparser = require("body-parser");
const products = require("./Backend/models/products");
const orders = require("./Backend/models/Order");
const Cart = require("./Backend/models/Cart");
const mens_cloths = require("./Backend/models/mens_cloths");
const { response } = require("express");
const create_user = require("./Backend/models/createuser");
const { getHashes, createHash } = require("crypto");
const jwt = require("jsonwebtoken");
const { auth } = require("./authentication");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.SRTIPE_SECRET);
const endpointSecret = process.env.ENDPOINT_SECRET;
app.use(cors());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieParser());

// connect to data base

mongoose
  .connect(
    `mongodb+srv://ShopAdmin:${process.env.MONGODB_PASSWORD}@cluster0.bmzim.mongodb.net/e_commerce?retryWrites=true&w=majority`
  )
  .then(() => console.log("connected"))
  .catch((err) => console.log("not connected"));
// static file serving
app.use("/mens-cloths", express.static("./Backend/mens-cloths"));
app.use("/static", express.static(path.join(__dirname, "Frontend", "static")));
app.use("/pages", express.static("./Frontend"));
var options = {
  root: path.resolve(__dirname, "Frontend"),
};

app.get("/", (req, res) => {
  res.sendFile("Index.html", options, (err) => {
    if (err) res.sendStatus(500);
    else {
      console.log("sent");
    }
  });
});

app.get("/user", (req, res) => {
  let token = req.cookies.jwt;
  if (token) {
    let user = jwt.verify(token, "wildshoter@123");
    res.json(user);
  } else {
    res.json(null);
  }
});

app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.json({ user: "logout" });
});

app.get("/register_user", (req, res) => {
  res.sendFile("CreateUser.html", options, (err) => {
    err ? res.sendStatus(500) : console.log(create_user);
  });
});


app.get("/login", (req, res) => {
  res.sendFile("login.html", options, (err) =>
    err ? res.sendStatus(500) : res.status(200)
  );
});


app.get("/product/:id", (req, res) => {
  res.sendFile("product.html", options, (err) =>
    err ? console.log(err.message) : console.log("product")
  );
});

app.get("/api/product/:id", (req, res) => {
  mens_cloths.findOne({ id: req.params.id }, (err, data) =>
    err ? console.log(err.message) : res.json(data)
  );
});

app.get("/cart", auth, (req, res) => {
  res.sendFile("cart.html", options, (err) =>
    err ? res.sendStatus(404) : console.log("cart")
  );
});

app.get("/api/cart", (req, res) => {
  Cart.find({}, (err, data) => {
    err ? res.sendStatus(404) : res.json(data);
  });
});

app.get("/orders/:id", (req, res) => {
  res.sendFile("orders.html", options, (err) => {
    err ? res.sendStatus(404) : console.log("orders")
  })
})

app.get('/orders', (req, res) => {
  res.sendFile('orderHistory.html', options, (err) => {
    err ? res.sendStatus(404) : console.log('ordershistory')
  })
})

app.get('/api/Orders/:user', (req, res) => {
  orders.find({ User: req.params.user }, (err, Orders) => {
    err ? res.json({ err: err.message }) : res.json(Orders)
  })
})

app.get("/api/order/:id", (req, res) => {
  orders.findById({ _id: req.params.id}, (err, order) => {
   err ? res.json({error:"order not found"}) : res.json(order)
 })
});


app.get("/success", (req, res) => {
  res.sendFile("success.html", options, (err) => {
    err ? res.sendStatus(404) : console.log("success")
  })
})

app.get("/cancel", (req, res) => {
  res.sendFile("cancel.html", options, (err) => {
    err ? res.sendStatus(404) : console.log("cancel")
  })
})

app.get("/product/womens-shoes", (req, res) => {
  products.find({}, (err, data) => {
    err ? console.log(err.message) : res.json(data);
  });
});



app.get("/cloths/mens-cloths", (req, res) => {
  mens_cloths.find({}, (err, data) => {
    err ? console.log(err.message) : res.json(data);
  });
});


app.post("/api/create_user", (req, res) => {
  create_user.findOne({ username: req.body.username }, (err, user) => {
    if (user) {
      res.send("Username Already Exist");
    } else {
      let new_user = new create_user({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
      });
      res.send("user created");
      new_user.save().then((res) => {
        console.log(res);
      });
    }
  });
});

app.post("/verifyuser", (req, res) => {
  console.log({ username: req.body.username, password: req.body.password });
  create_user.findOne(
    { username: req.body.username, password: req.body.password },
    (err, user) => {
      if (user) {
        let token = jwt.sign(user.username, "wildshoter@123");
        res.cookie("jwt", token, { httpOnly: true });
        res.json({ user: user });
        console.log("Login Successfully");
      } else {
        console.log("Invalid Username or Password");
        console.log({
          username: req.body.username,
          password: req.body.password,
        });
        res.sendStatus(404);
      }
    }
  );
});


app.post("/add_to_cart", (req, res) => {
  var cart = new Cart({
    img: req.body.image,
    title: req.body.title,
    price: req.body.price,
    id: req.body.id,
  });
  cart
    .save()
    .then((data) => console.log(data))
    .catch((err) => res.sendStatus(404));
});

app.post("/checkout", async (req, res) => {
  try {
    
    let token = req.cookies.jwt;
    if (token) {
      var user = jwt.verify(token, "wildshoter@123");
    }
    let cart = req.body.cart;
    let product_data = [];
    let check_out_product;
    check_out_product = cart.map((product) => {
      return {
        price_data: {
          currency: "INR",
          product_data: {
            name: product.title,
            images: [product.img],
          },
          unit_amount: product.price * 100,
        },
        quantity: 1,
      };
    });
    product_data = [...check_out_product];
    
    const customer = await stripe.customers.create({
      name: user,
      description:req.body.order_id
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer: customer.id,
      line_items: [...product_data],
      success_url: `${process.env.HOST}success`,
      cancel_url: `${process.env.HOST}cancel`,
    });
    res.json({ session: session.url });

    // console.log(session.url)
  } catch (error) {
    res.json({ error: error });
  }
});



app.post("/webhook", (request, response) => {
  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.rawBody,
      sig,
      endpointSecret
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  //Handle the event
  switch (event.type) {
    case "price.created":
      const price = event.data.object;
      // Then define and call a function to handle the event price.created
      console.log(`Price=${price}`)
      break;
    case "product.created":
      const product = event.data.object;
      // Then define and call a function to handle the event product.created
      console.log(`Product=${product}`)
      break;
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      let user = paymentIntent.charges.data[0].customer;
      async function customer_retrive() {
        let customer = await stripe.customers.retrieve(user);
        orders.findByIdAndUpdate(customer.description, { ispaid: true }, (err, update) => {
          err ? console.log(err.message) : console.log(update)
        })
      }
      customer_retrive();
      // console.log(customer)
      // console.log({
      //   id: paymentIntent.id,
      //   amount: paymentIntent.amount,
      //   payment: paymentIntent.payment_method_types[0],
      //   status: paymentIntent.status,
      // });
      //  let user_orders = new orders({
      //     id:paymentIntent.id ,
      //     amount: paymentIntent.amount,
      //     payment_methods_types: paymentIntent.payment_method_types[0],
      //     status: paymentIntent.status,
      //  })
      //   user_orders.save().then(orders=>console.log(orders))
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

app.post('/order', async(req, res) => {
  try {
    console.log(req.body.user)
    let new_order = orders({
      items: [...req.body.orderitem],
      ispaid: false,
      User:req.body.user
    })
    let saved = await new_order.save()
    res.json(saved._id)
  } catch (error) {
    res.json(error.message)
  }
})

app.delete("/delete/cart/:id", (req, res) => {
  Cart.deleteOne({ id: req.params.id }, (err, data) =>
    err ? console.log(err.message) : res.json(data)
  );
});


app.listen(port, () => {
  console.log(`Example app listening at https://localhost:${port}`);
});

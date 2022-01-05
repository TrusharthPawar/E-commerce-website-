const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const port = process.env.PORT || 3000;
const bodyparser = require("body-parser");
const products = require("./Backend/models/products");
const Cart = require("./Backend/models/Cart");
const womens_cloths = require("./Backend/models/womens-cloths");
const mens_cloths = require("./Backend/models/mens_cloths");
const { response } = require("express");
const create_user = require("./Backend/models/createuser");
const { getHashes, createHash } = require("crypto");
const jwt = require("jsonwebtoken");
const { auth } = require("./authentication");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51KDLqpSGNZUVUgDHasKuZj75JTukQphjuOgsGnF49Qi1EMkkXEuKct8PmI85PZAB87Qhc5r7RvCByuBhy2CzbYvJ000DQaEMLP"
);
const endpointSecret = "whsec_BW0VHk2WjF59P8XlhXzOhLuZktgSO7Cg";
app.use(cors());
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieParser());

// connect to data base

mongoose
  .connect(
    "mongodb+srv://ShopAdmin:wildshooter@cluster0.bmzim.mongodb.net/e_commerce?retryWrites=true&w=majority"
  )
  .then(() => console.log("connected"))
  .catch((err) => console.log("not connected"));
// static file serving
app.use("/mens-cloths", express.static("./Backend/mens-cloths"));
app.use("/mens-shoes", express.static("./Backend/mens-shoes"));
app.use("/womens-cloths", express.static("./Backend/womens-cloths"));
app.use("/womens-shoes", express.static("./Backend/womens-shoes"));
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

app.get("/login", (req, res) => {
  res.sendFile("login.html", options, (err) =>
    err ? res.sendStatus(500) : res.status(200)
  );
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

app.get("/product/:id", (req, res) => {
  res.sendFile("product.html", options, (err) =>
    err ? console.log(err.message) : console.log("product")
  );
});

app.get("/api/product/:id", (req, res) => {
  womens_cloths.findOne({ id: req.params.id }, (err, data) =>
    err ? console.log(err.message) : res.json(data)
  );
});

app.get("/cart", auth, (req, res) => {
  res.sendFile("cart.html", options, (err) =>
    err ? res.sendStatus(404) : console.log("cart")
  );
});

app.delete("/delete/cart/:id", (req, res) => {
  Cart.deleteOne({ id: req.params.id }, (err, data) =>
    err ? console.log(err.message) : res.json(data)
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

app.get("/api/cart", (req, res) => {
  Cart.find({}, (err, data) => {
    err ? res.sendStatus(404) : res.json(data);
  });
});

// app.get('/checkout', (req, res) => {
//   res.sendFile('checkout.html',options,(err)=> {
//     if (err)
//       console.log(err);
//     else {
//       console.log("sent")
//     }
//   })
// })

app.get("/product/womens-shoes", (req, res) => {
  products.find({}, (err, data) => {
    err ? console.log(err.message) : res.json(data);
  });
});

app.get("/cloths/womens-cloths", (req, res) => {
  womens_cloths.find({}, (err, data) => {
    err ? console.log(err.message) : res.json(data);
  });
});

app.post("/checkout", async (req, res) => {
  try {
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [...product_data],
      success_url: "https://shop-cloths.herokuapp.com/pages/success.html",
      cancel_url: "https://shop-cloths.herokuapp.com/pages/cancel.html",
    });
    res.json({ session: session.url });
  } catch (error) {
    res.json({ error: error });
  }
});

app.post("/webhook",bodyparser.raw({type: 'application/json'}),(request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(paymentIntent)
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

app.listen(port, () => {
  console.log(`Example app listening at https://shop-cloths.herokuapp.com:${port}`);
});

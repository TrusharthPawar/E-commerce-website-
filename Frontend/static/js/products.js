import getproducts from "./getproducts.js";
import parseurl from "./parseurl.js";

async function products() {
  try {
    const user = await fetch("http://localhost:3000/user");
    var userdata = await user.json();
    if (user) {
      let user_tab = `<div id="user_info">
      <h3>${userdata}</h3>
      <button id="logout">logout</button>
      </div>`;
      document
        .getElementById("account")
        .insertAdjacentHTML("beforeend", user_tab);
    }
    let btn = document.getElementById("logout");
    btn.addEventListener("click", async () => {
      let logout = await fetch("http://localhost:3000/logout");
      document.location = "/";
    });
    let path = document.location.pathname;
    let url = `http://localhost:3000/api${path}`;
    let response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    response = await response.json();
    return `
<div class="product-info main-info">
  <div class="info" id="info">
  <img src=${response.img} class="img-data" alt="image">
  <p class="label">${response.title}</p>
  <span>₹<p class="price">${response.price}</p></span>
  <a class="cart" id='shop'>Add to Cart</a>
  </div>
</div>`;
  } catch (error) {
    console.log("unable to fetch products");
  }
}

products().then((data) => {
  document.getElementById("main-container").innerHTML = data;
  add_to_cart();
});

function add_to_cart() {
  var cart = document.getElementById("shop");
  cart.addEventListener("click", async () => {
    let url = parseurl();
    let response = await product();
    let img = response.img;
    let label = response.title;
    let price = response.price;
    let product_info = {
      image: img,
      title: label,
      price: price,
      id: url.id,
    };
    send_to_cart(product_info);
    alert("Added to Cart")
  });
}

async function product() {
  let url = parseurl();
  return getproducts(url.id);
}

function send_to_cart(cart_info) {
  fetch("http://localhost:3000/add_to_cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cart_info),
  });
}

import HOST from "./host.js";
import parseurl from "./parseurl.js";
async function orders() {
  try {
    const user = await fetch(`${HOST}user`);
    let order_id = parseurl();
    var order = await fetch(`${HOST}api/order/${order_id.id}`);
    order = await order.json();
    var userdata = await user.json();
    let loader = document.getElementById("loader_container");
    if (order) {
      if (userdata) {
        loader.style.display = "none";
        let user_tab = `<div id="user_info">
        <h3>${userdata}</h3>
        <a href="/orders">Orders</a>
        <button id="logout">logout</button>
        </div>`;
        document
          .getElementById("account")
          .insertAdjacentHTML("beforeend", user_tab);
        let btn = document.getElementById("logout");
        btn.addEventListener("click", async () => {
          let logout = await fetch(`${HOST}logout`);
          logout = await logout.json();
          console.log(logout);
          document.location = "/";
        });
      }
      let display_orders = `${order.items
        .map(
          (order_data) => `
     <div class="orders">
     <img src=${order_data.img} width="200" height="200">
     <p class="order_title">${order_data.title}</p>
     <p class="order_price">₹${order_data.price}</p>
     <p>${order.ispaid ? `<span id="paid">Payment Successfull</span>` : `<span id="unpaid">Not Paid</span>`}</p>
     </div>
    `
        )
        .join("\n")}`;
      document.getElementById("order").innerHTML = display_orders;
      if (order.ispaid === false) {
        let order_btn = document.createElement("button");
        order_btn.innerText = "Order";
        order_btn.id = "order_btn";
        document.getElementById("container").appendChild(order_btn);
        order_btn.addEventListener("click", stripe_checkout);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

orders();

async function stripe_checkout () {
  var loader = document.getElementById("loader");
  document
    .getElementById("main-container")
    .insertAdjacentHTML("beforeend", `<div id='loader'></div>`);
  loader.style.display = "block";
  let place_order_id = parseurl();
  var place_order = await fetch(`${HOST}api/order/${place_order_id.id}`);
  place_order = await place_order.json();
  console.log(place_order.items)
  let checkout = await fetch(`${HOST}checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cart: [...place_order.items],order_id: place_order_id.id }),
  });
  let payout = await checkout.json();
  console.log(payout)
  window.location = payout.session
  loader.style.display = "none";
}

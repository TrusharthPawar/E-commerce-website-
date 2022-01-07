import HOST from "./host.js";

async function orderHistory() {
  try {
    const user = await fetch(`${HOST}user`);
    var userdata = await user.json();
    let loader = document.getElementById("loader_container");
    let order = await fetch(`${HOST}api/Orders/${userdata}`);
    order = await order.json();
    console.log(order);
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
      let display_orders = `${order.map(
        (Orders) =>
          `<div class="order_history">
          <div>
            <span>Order ID:</span><p>${Orders._id}</p>
            <a href=${HOST}orders/${Orders._id} class="order_link">details</a>
          </div>  
            </div>`
      ).join('\n')}`;
      console.log(display_orders);
      document.getElementById("container").innerHTML = display_orders;
    }
  } catch (error) {
    console.log(error.message);
  }
}

orderHistory();

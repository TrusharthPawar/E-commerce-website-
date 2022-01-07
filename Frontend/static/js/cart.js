import HOST from "./host.js";
async function cart() {
  try {
    const user = await fetch(`${HOST}user`);
    var userdata = await user.json();
    if (user) {
      let user_tab = `<div id="user_info">
      <h3>${userdata}</h3>
      <a href="/orders">Orders</a><br>
      <button id="logout">logout</button>
      </div>`;
      document
        .getElementById("account")
        .insertAdjacentHTML("beforeend", user_tab);
      let btn = document.getElementById("logout");
      btn.addEventListener("click", async () => {
        let logout = await fetch(`${HOST}logout`);
        document.location = "/";
      });
    } else if (!userdata) {
      document.getElementById("account").style.display = "none";
      document.getElementById(
        "account"
      ).innerHTML = `<a href="/login" class="login">Login</a>`;
    }

    await showcart();
  } catch (error) {
    console.log(error.message);
  }
}

cart();

async function showcart() {
  try {
    var loader = document.getElementById("loader");
    let price = 0;
    let data = await fetch(`${HOST}api/cart`);
    let getdata = await data.json();
    if (data) {
      loader.style.display = "none";
      let cart_data = `${getdata
        .map(
          (data) => `
    <div class="cart-element">
    <div class="info" id="info">
    <img src=${data.img} alt="image">
    <p class="label" >${data.title}</p>
    <p class="price cart-price">₹${data.price}</p>
    <a class="remove" id=${data.id}>Remove</a>
    </div>
  </div> 
    `
        )
        .join("\n")} `;

      document.getElementById("container").innerHTML = cart_data;
      let result = getdata.map((data) => {
        return (price = price + data.price);
      });
      document.getElementById("price").innerHTML = `₹${price}`;
      deletebtn();
    } else {
      document.getElementById("api").innerHTML = loader;
    }
  } catch (error) {
    console.log(error.message);
  }
}

function deletebtn() {
  let btn = document.getElementsByClassName("remove");
  let collection = [];
  for (let property in btn) {
    if (btn.hasOwnProperty(property)) {
      collection.push(property);
    }
  }
  for (let i = 0; i <= collection.length - 1; i++) {
    let id = btn.item(i).id;
    var ele = document.getElementById(id);
    ele.addEventListener("click", async () => {
      try {
        var delete_data = await fetch(`${HOST}delete/cart/${Number(id)}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        delete_data = await delete_data.json();
        await showcart();
      } catch (error) {
        console.log(error.message);
      }
    });
  }
}

const checkout = document.getElementById("checkout");
checkout.addEventListener("click", async () => {
  try {
    // window.location = payout.session;
    const user = await fetch(`${HOST}user`);
    var userdata = await user.json();
    let cart = await fetch(`${HOST}api/cart`);
    cart = await cart.json();
    let order = await fetch(`${HOST}order`, {
      method: "POST",
      headers: {
        "Content-Type":"application/json"
      },
      body:JSON.stringify({orderitem:cart,user:userdata})
    })
    let order_id = await order.json()
    window.location = `${HOST}orders/${order_id}`
  } catch (error) {
    console.log(error.message);
  }
});

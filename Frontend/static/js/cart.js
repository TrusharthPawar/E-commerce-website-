async function cart() {
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
    await showcart();
  } catch (error) {
    console.log(error.message);
  }
}

cart();

async function showcart() {
  try {
    let loader = document.getElementById("loader");
    let price = 0;
    let data = await fetch("http://localhost:3000/api/cart");
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
      document.getElementById('api').innerHTML = loader
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
        var delete_data = await fetch(
          `http://localhost:3000/delete/cart/${Number(id)}`,
          { method: "DELETE", headers: { "Content-Type": "application/json" } }
        );
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
    let checkout_data = await fetch("http://localhost:3000/api/cart");
    checkout_data = await checkout_data.json();
    let check_out = await fetch("http://localhost:3000/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart: [...checkout_data] }),
    });
    let checkout = await check_out.json();
    window.location = checkout.session;
  } catch (error) {
    console.log(error.message);
  }
});

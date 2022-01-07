import HOST from "./host.js";

async function cancel() {
  try {
    const user = await fetch(`${HOST}user`);
    var userdata = await user.json();
    if (userdata) {
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
  } catch (error) {
    console.log(error.message);
  }
}

cancel()
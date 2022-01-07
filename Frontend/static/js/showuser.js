export default function showUser() {
    let loader = document.getElementById("loader_container");
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
    })
    }
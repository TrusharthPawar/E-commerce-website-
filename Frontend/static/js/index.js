//old method to render elements
// async function getapi() {
//   try {
//     const res = await fetch("https://shop-cloths.herokuapp.com/cloths/womens-cloths");
//     var data = await res.json();
//     for (let i = 0; i <= 4 - 1; i++) {
//       showdata(data, i);
//     }
//   } catch (error) {
//     console.log("error");
//   }
// }

// getapi();

// function showdata(data, i) {
//   let tab = `
//     <div class="product">
//      <div class="info">
//       <a href="/product/${data[i].id}"><img src=${data[i].img}></a>
//       <p class="label">${data[i].title}</p>
//       <p class="type">${data[i].brand}</p>
//       <span>₹<p class="price">${data[i].price}</p></span>
//      </div>
//     </div>`;
//   var ele = document.getElementById("api");
//   ele.insertAdjacentHTML("beforeend", tab);
// }

//more eficient method
async function getapi() {
  try {
    const res = await fetch(
      "https://shop-cloths.herokuapp.com/cloths/womens-cloths"
    );
    var data = await res.json();
    const user = await fetch("https://shop-cloths.herokuapp.com/user");
    var userdata = await user.json();
    let loader = document.getElementById("loader_container");
    if (res) {
      if (userdata) {
        loader.style.display = "none";
        let user_tab = `<div id="user_info">
        <h3>${userdata}</h3>
        <button id="logout">logout</button>
        </div>`;
        document
          .getElementById("account")
          .insertAdjacentHTML("beforeend", user_tab);
        let btn = document.getElementById("logout");
        btn.addEventListener("click", async () => {
          let logout = await fetch("https://shop-cloths.herokuapp.com/logout");
          logout = await logout.json();
          console.log(logout);
          document.location = "/";
        });
      } else if (!userdata) {
        loader.style.display = "none";
        document.getElementById(
          "account"
        ).innerHTML = `<a href="/login" class="login">Login</a>`;
      }
      let content;
      content = `${data
        .map(
          (data) => `
      <div class="product">
       <div class="info">
        <a href="/product/${data.id}"><img src=${data.img} alt="image"></a>
        <p class="label">${data.title}</p>
        <p class="type">${data.brand}</p>
        <span>₹<p class="price">${data.price}</p></span>
       </div>
      </div>
      `
        )
        .join("\n")}`;
      document.getElementById("api").innerHTML = content;
    } else {
      console.log("no data");
      document.getElementById("api").innerHTML = loader;
    }
  } catch (error) {
    console.log(error.message);
  }
}

getapi();

import HOST from "./host.js";
let btn = document.getElementById("login");

async function checkuser() {
  try {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    let User = {
      username: username,
      password: password,
    };
    let getuser = await fetch(`${HOST}verifyuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(User),
    });

    if (getuser.status === 404) {
      window.alert("Invalid username or password");
    } else {
      window.alert("Login Successfull");
      document.location = `${HOST}`;
    }
  } catch (error) {
    console.log(error.message);
  }
}
btn.addEventListener("click", checkuser);

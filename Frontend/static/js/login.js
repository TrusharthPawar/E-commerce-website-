let btn = document.getElementById("login");

async function checkuser() {
  try {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    let getuser = await fetch("https://shop-cloths.herokuapp.com/verifyuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });
    var user = await getuser.json();
    if (getuser.status === 403) {
      window.alert("Invalid username or password");
    } else {
      console.log(user);
      window.alert("Login Successfull");

      document.location = "https://shop-cloths.herokuapp.com/";
    }
  } catch (error) {
    console.log("error");
  }
}
btn.addEventListener("click", checkuser);

let sElement = document.querySelector(".signup-form") || [];
let loginElement = document.querySelector(".login-form") || [];
let logoutElement = document.querySelector("#logout-Btn") || [];
let updateForm = document.querySelector(".updateForm") || [];
let changeProfileImg = document.querySelector("#changeProfileImg") || [];
let forgetPassBtn = document.querySelector("#forgetPassBtn") || [];
let forgotPassForm = document.querySelector(".forgotPass-form") || [];
let bookingBtn = document.querySelector("#bookingBtn") || [];
let reviewBtn = document.querySelector("#reviewBtn") || [];
let errBox = document.querySelector("#errBox");

// let selectFav = document.querySelector("#selectFav") || [];

// import Stripe from "Stripe";
const stripe = Stripe(
  "pk_test_51LtrEsL04f8ZItyZ3NEN3UOSN7xC5ITlmJ0KwiB18xxJfm0nh1IxmZPjGH5NfCWwB7m4Xloy5i6YGWpZ2nfXWcuI00DRKOqxfm"
);
// import showAlert from "./showAlert";
// SIGNUP COMPONENT
if (sElement.length !== 0) {
  sElement.addEventListener("submit", async (e) => {
    try {
      e.preventDefault();
      let name = document.querySelector("#sname").value;
      let email = document.querySelector("#semail").value;
      let pass = document.querySelector("#spass").value;
      let cpass = document.querySelector("#scpass").value;

      const body = {
        name: name,
        email: email,
        password: pass,
        cpassword: cpass,
      };

      const url = `/api/v1/users/signup`;
      let res = await axios({
        method: "POST",
        url: url,
        data: body,
      });

      if (res.data.status === "success") {
        errBox.classList.add("text-green-500");

        errBox.innerText = "Congratulations Signin Successfully";
        errBox.classList.remove("text-red-900");
        window.location.replace("/overview");
      }
    } catch (err) {
      if (err.response.data) {
        const errmsg = err.response.data.message.split(":");

        if (errmsg[1]) {
          if (errmsg[1].includes("email")) {
            errBox.innerText = errmsg[2];
          }
        } else {
          errBox.innerText = err.response.data.message;
        }
        errBox.classList.add("text-red-900");
        errBox.classList.remove("text-gray-900");
      }
    }
  });
}
// LOGIN COMPONENT
if (loginElement.length !== 0) {
  loginElement.addEventListener("submit", async (e) => {
    e.preventDefault();
    let email = document.querySelector("#lemail").value;
    let pass = document.querySelector("#lpass").value;

    try {
      const body = {
        email: email,
        password: pass,
      };

      const url = `/api/v1/users/login`;
      let res = await axios({
        method: "POST",
        url: url,
        data: body,
      });
      const cookieOption = {
        secure: true,
      };
      // res.cookie("jwt", res.authToken, cookieOption);

      if (res.data.status === "success") {
        errBox.innerText = "Congratulations Login Successfully";
        errBox.classList.add("text-green-500");
        errBox.classList.remove("text-red-900");
        location.href = "/overview";
      }
    } catch (err) {
      if (err.response) {
        errBox.innerText = err.response.data.message;
      } else {
        errBox.innerText = "An internal Error Occurred";
      }
      errBox.classList.add("text-red-900");
      errBox.classList.remove("text-gray-900");
    }
  });
}
// Logging out of the User
if (logoutElement.length !== 0) {
  logoutElement.addEventListener("click", async () => {
    const res = await axios({
      method: "get",
      url: "/api/v1/users/logout",
    });

    if (res.data.status === "success") {
      location.assign("/overview");
    }
  });
}
// Activating input method
if (changeProfileImg.length !== 0) {
  changeProfileImg.addEventListener("click", (e) => {
    e.preventDefault();
    let fileInput = document.querySelector("#fileinput");
    fileInput.click();
  });
}
// Updating the profile
if (updateForm.length !== 0) {
  updateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let name = document.getElementById("user-profile-name").value;
    let photo = document.getElementById("fileinput").files[0];
    const form = new FormData();
    if (name.length > 0) {
      form.append("name", name);
    }

    if (photo) {
      form.append("photo", photo);
    }

    let res = await axios({
      method: "patch",
      url: `/api/v1/users/updateProfile`,
      data: form,
    });

    if (res.data.status === "success") {
      location.reload();
    }
  });
}
//Setting the Forget Password
if (forgetPassBtn.length !== 0) {
  forgetPassBtn.addEventListener("click", async () => {
    let email = document.querySelector("#lemail").value;
    if (!email.length > 0) {
      email = "fail";
    }
    let obj = {
      email: email,
    };

    let res = await axios({
      method: "post",
      url: "/api/v1/users/forgetPassword",
      data: obj,
    });

    if (res.data.status === "success") {
      alert("An Email is sent to You So Reset Your Password");
    } else if (res.data.status === "fail") {
      alert(res.data.message);
    }
  });
}

if (forgotPassForm.length !== 0) {
  forgotPassForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let pass = document.getElementById("fpass").value;
    let cpass = document.getElementById("fcpass").value;
    let errBox = document.querySelector("#errBox");

    const obj = {
      password: pass,
      cpassword: cpass,
    };
    const res = await axios({
      method: "post",
      url: "/api/v1/users/resetPassword",
      data: obj,
    });
    if (res.data.status === "fail") {
      errBox.innerText = res.data.message;
      errBox.classList.add("text-red-300");
    } else {
      location.assign(`/users/${res.data.id}`);
    }
  });
}

if (bookingBtn.length !== 0) {
  bookingBtn.addEventListener("click", async (e) => {
    bookingBtn.innerText = "Processing...";

    let session = await axios({
      method: "get",
      url: `/api/v1/users/checkout-session/${e.target.name}`,
    });

    console.log("hii from the session");
    if (session.data.status === "success") {
    }
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  });
}

function starBox(id) {
  let starBoxes = document.querySelectorAll(".ratingStars");

  starBoxes.forEach((el, index) => {
    if (index < id) {
      el.classList.add("text-green-500");
      el.setAttribute("name", `${id}`);
    }
    if (index > id - 1) {
      el.classList.remove("text-green-500");
    }
  });
}

if (reviewBtn.length !== 0) {
  reviewBtn.addEventListener("click", async (e) => {
    let text = document.querySelector("#RTB").value;
    let rating = document.querySelector(".ratingStars").getAttribute("name");
    console.log(text, rating);
    let tourId = e.target.name;
    // let userId = e.target.name.split()[1];
    console.log(tourId);
    let url = `/api/v1/users/sendReview/${tourId}`;
    let obj = {
      review: text,
      rating: rating,
    };
    try {
      let res = await axios({
        url: url,
        method: "post",
        data: obj,
      });
      if (res.data.status === "success") {
        alert("Succesfully uploaded Your  Review");
        location.reload();
      }
    } catch (err) {
      console.log("this error is");
      console.log(err);
      alert(err.response.data.message);
    }
  });
}

const selectFav = async (tourId, userId) => {
  console.log("in the select Favorite function");

  const TourId = JSON.stringify(tourId);
  let response = await axios(`/api/v1/users/selectFav/${TourId}`);
  console.log(response);
  if (response.data.status == "success") {
    location.reload();
  }
};

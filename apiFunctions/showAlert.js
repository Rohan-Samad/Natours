const showAlert = (status, message) => {
  let alertBox = document.querySelector(".alertBox");
  let messBox = document.querySelector(".mess");

  if ((status = "success")) {
    // alertBox.classList.remove("hidden");
    alertBox.classList.add("bg-green-500");
    // messBox.innerText = message;
  } else if ((status = "fail")) {
    alertBox.classList.add("bg-red-500");
  }
  messBox.innerText = message;
  setTimeout(() => {
    alertBox.classList.add("hidden");
  }, 5000);
};
module.exports = showAlert;

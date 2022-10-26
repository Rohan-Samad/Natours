const app = require("./app");
// console.log(process.env);

const port = 8000;
app.listen(port, () => {
  console.log(`Server is listening on port http://localhost:${8000}/overview`);
});

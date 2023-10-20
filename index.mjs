// Import modules using ES6 syntax
import express from "express";
import mitiAccount from "miti-account";
import mitiAuth from "miti-auth";
import mitiSettings from "miti-settings";

const app = express();
const port = 3000;
app.get("/", (req, res) => {
  // Respond with a JSON object
  res.json({ message: "Hello, World!" });
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

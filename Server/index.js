const bodyparser = require("body-parser");
const express = require("express");
const app = express();
const cors = require("cors");
const { connect } = require("./config/db");
const router = require("./routes/index");
const port = process.env.PORT || 5000;

app.use(cors({ origin: "*", credentials: true }));
app.use(bodyparser.json({ limit: "50mb" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "InternArea backend API is running successfully",
  });
});

app.use("/api", router);

connect();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

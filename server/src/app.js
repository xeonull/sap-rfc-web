import express from "express";
import sapRouter from "./route/sap.route.js";

const PORT = process.env.PORT || 3000;

const app = express();

// Add CORS:
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", " http://127.0.0.1:3001");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Add routes:
app.use("/api", sapRouter);

app.listen(PORT, function () {
  console.log("Server started...");
});

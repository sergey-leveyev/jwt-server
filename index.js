const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");

const router = require("./router/index");
const errorMiddleware = require("./middlewares/error.middleware");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(morgan("dev"));
app.use(cookieParser());

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api", router);
app.use(errorMiddleware);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("connected to Database");
    app.listen(PORT, () => console.log(`Server is runing on port : ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();

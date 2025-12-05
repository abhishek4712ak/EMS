import express from "express";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import { hostname } from "../utils/host.js";
import cookieParser from "cookie-parser";
import superAdmin from "../modules/superAdmin.module.js";
import Admin from "../modules/admin.module.js";
import router from "../modules/user.module.js";
import session from "express-session";
import flash from "connect-flash";

import { fileURLToPath } from "url";
import path from "path"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
connectDB();



app.use("/superadmin", superAdmin);
app.use("/admin", Admin);
app.use("/user", router);
app.get("/ems", (req, res) => {
  res.render("select_panel");
});

app.get("/", (req, res) => {
  res.render("user/userLogin");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit at ${hostname}:${PORT}`);
});

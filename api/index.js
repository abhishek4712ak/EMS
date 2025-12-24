import express from "express";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import { hostname } from "../utils/host.js";
import cookieParser from "cookie-parser";
import superAdmin from "../modules/superAdmin.module.js";
import Admin from "../modules/admin.module.js";
import session from "express-session";



import { fileURLToPath } from "url";
import path from "path"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || "defaultsecret",
  resave: false,
  saveUninitialized: true,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
connectDB();



app.use("/superadmin", superAdmin);
app.use("/admin", Admin);

app.get("/developer", (req, res) => { 
  res.render("developer/dev");
});
app.get("/", (req, res) => {
  res.render("select_panel");
});





const PORT = process.env.PORT || 8090;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit at ${hostname}:${PORT}`);
});

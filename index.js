import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from "cookie-parser";
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/auth' , authRoutes);
app.use('/user' , userRoutes);

app.get("/", (req, res) => {
  try {
    res.status(200).render("home.ejs");
  } catch (err) {
    console.error("GET / error:", err.message);
    res.status(500).send("Internal server error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
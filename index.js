import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import loginRoutes from './routes/loginRoutes.js';
import userRoutes from './routes/userRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/login' , loginRoutes);
app.use('/user' , userRoutes);
app.use('/buyer', buyerRoutes);
app.use('/seller', sellerRoutes);

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
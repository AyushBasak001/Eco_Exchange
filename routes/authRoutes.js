import express from 'express';
import {
    renderLoginPage,
    login,
    signup,
    logout
} from '../controllers/authController.js';

const router = express.Router();

router.get('/', renderLoginPage);
router.post('/login', login);
router.post('/signup', signup);
router.post('/logout', logout);

export default router;
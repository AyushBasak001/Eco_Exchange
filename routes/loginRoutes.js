import express from 'express';
import {
    renderLoginPage,
    loginUser,
    signupUser
} from '../controllers/loginController.js';

const router = express.Router();

router.get('/', renderLoginPage);
router.post('/', loginUser);
router.post('/signup', signupUser);

export default router;
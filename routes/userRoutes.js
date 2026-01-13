import express from 'express';
import {renderUserPage} from '../controllers/userController.js';

const router = express.Router();

router.get('/', renderUserPage);

export default router;
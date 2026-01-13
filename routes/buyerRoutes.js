import express from 'express';
import {renderBuyerPage} from '../controllers/buyerController.js';

const router = express.Router();

router.get('/', renderBuyerPage);

export default router;
import express from 'express';
import {renderSellerPage} from '../controllers/sellerController.js';

const router = express.Router();

router.get('/', renderSellerPage);

export default router;
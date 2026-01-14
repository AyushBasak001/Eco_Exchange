import express from 'express';
import {
    renderUserPage,
    renderBuyPage,
    renderSellPage,
    renderBuyingHistory,
    renderSellingHistory
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', renderUserPage);
router.get('/buy', renderBuyPage);
router.get('/sell', renderSellPage);
router.get('/buyingHistory', renderBuyingHistory);
router.get('/sellingHistory', renderSellingHistory);

export default router;
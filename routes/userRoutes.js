import express from 'express';
import {
    renderUserPage,
    renderMarketplace,
    renderSellPage,
    renderUserOrders,
    renderUserProfile
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', renderUserPage);
router.get('/marketplace', renderMarketplace);
router.get('/sell', renderSellPage);
router.get('/orders', renderUserOrders);
router.get('/profile', renderUserProfile);

export default router;
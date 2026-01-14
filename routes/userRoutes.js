import express from 'express';
import {
    renderUserPage,
    renderMarketplace,
    renderSellPage,
    renderUserOrders,
    renderUserProfile
} from '../controllers/userController.js';
import {authRequired} from '../middlewares/auth.js'

const router = express.Router();

router.get('/', authRequired(['USER']), renderUserPage);
router.get('/marketplace', authRequired(['USER']), renderMarketplace);
router.get('/sell', authRequired(['USER']), renderSellPage);
router.get('/orders', authRequired(['USER']), renderUserOrders);
router.get('/profile', authRequired(['USER']), renderUserProfile);

export default router;
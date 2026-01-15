import express from 'express';
import {
    renderUserPage,
    renderMarketplace,
    renderSellPage,
    renderUserOrders,
    renderUserProfile,
    editUserAddress
} from '../controllers/userController.js';
import {authRequired} from '../middlewares/auth.js'
import e from 'express';

const router = express.Router();

router.get('/', authRequired(['USER']), renderUserPage);
router.get('/marketplace', authRequired(['USER']), renderMarketplace);
router.get('/sell', authRequired(['USER']), renderSellPage);
router.get('/orders', authRequired(['USER']), renderUserOrders);
router.get('/profile', authRequired(['USER']), renderUserProfile);

router.post('/profile/address', authRequired(['USER']), editUserAddress);

export default router;
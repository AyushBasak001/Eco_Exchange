import express from 'express';
import {
    renderUserPage,
    renderMarketplace,
    renderSellPage,
    renderUserOrders,
    renderUserProfile,
    sellNewProduct,
    editUserAddress,
    createNewOrder,
    cancelOrder,
    confirmOrder,
    restockProduct,
    removeProduct
} from '../controllers/userController.js';
import {authRequired} from '../middlewares/auth.js'

const router = express.Router();

router.get('/', authRequired(['USER']), renderUserPage);
router.get('/marketplace', authRequired(['USER']), renderMarketplace);
router.get('/sell', authRequired(['USER']), renderSellPage);
router.get('/orders', authRequired(['USER']), renderUserOrders);
router.get('/profile', authRequired(['USER']), renderUserProfile);

router.post('/sell/new', authRequired(['USER']), sellNewProduct);
router.post('/profile/address', authRequired(['USER']), editUserAddress);
router.post('/orders/create', authRequired(['USER']), createNewOrder);

router.post('/orders/:orderId/cancel', authRequired(['USER']), cancelOrder);
router.post('/orders/:orderId/confirm', authRequired(['USER']), confirmOrder);

router.post('/sell/:productId/restock', authRequired(['USER']), restockProduct);
router.post('/sell/:productId/remove', authRequired(['USER']), removeProduct);

export default router;
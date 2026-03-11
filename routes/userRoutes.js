import express from 'express';
import {
    renderMarketplace,
    renderMarketplaceCategory,
    renderSellPage,
    renderUserOrders,
    renderUserProfile,
    sellNewProduct,
    editUserAddress,
    restockProduct,
    removeProduct,
    relistProduct,
    placeOrder,
    cancelOrder
} from '../controllers/userController.js';
import {authRequired} from '../middlewares/auth.js'

const router = express.Router();

router.get('/marketplace', authRequired(['USER']), renderMarketplace);
router.get('/marketplace/category/:categoryId', authRequired(['USER']), renderMarketplaceCategory);
router.get('/sell', authRequired(['USER']), renderSellPage);
router.get('/orders', authRequired(['USER']), renderUserOrders);
router.get('/profile', authRequired(['USER']), renderUserProfile);

router.post('/profile/address', authRequired(['USER']), editUserAddress);

router.post('/sell/new', authRequired(['USER']), sellNewProduct);
router.post('/sell/:productId/restock', authRequired(['USER']), restockProduct);
router.post('/sell/:productId/remove', authRequired(['USER']), removeProduct);
router.post('/sell/:productId/relist', authRequired(['USER']), relistProduct);

router.post('/order/:productId/placeOrder', authRequired(['USER']), placeOrder);
router.post('/order/:orderId/:userType/cancel', authRequired(['USER']), cancelOrder);

export default router;
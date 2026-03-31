import express from 'express';
import {
    renderMarketplace,
    renderMarketplaceCategory,
    renderSellPage,
    renderUserOrders,
    renderUserProfile,
    showOrderDetails,
    showPaymentPage,
    sellNewProduct,
    editUserAddress,
    restockProduct,
    removeProduct,
    relistProduct,
    placeOrder,
    cancelOrder,
    completeOrder
} from '../controllers/userController.js';
import {authRequired} from '../middlewares/auth.js'

const router = express.Router();

router.get('/marketplace', authRequired(['USER']), renderMarketplace);
router.get('/marketplace/category/:categoryId', authRequired(['USER']), renderMarketplaceCategory);
router.get('/sell', authRequired(['USER']), renderSellPage);
router.get('/orders', authRequired(['USER']), renderUserOrders);
router.get('/profile', authRequired(['USER']), renderUserProfile);

router.get('/orders/:orderId', authRequired(['USER']), showOrderDetails);
router.get('/orders/:orderId/pay', authRequired(['USER']), showPaymentPage);

router.post('/profile/address', authRequired(['USER']), editUserAddress);

router.post('/sell/new', authRequired(['USER']), sellNewProduct);
router.post('/sell/:productId/restock', authRequired(['USER']), restockProduct);
router.post('/sell/:productId/remove', authRequired(['USER']), removeProduct);
router.post('/sell/:productId/relist', authRequired(['USER']), relistProduct);

router.post('/orders/:productId/placeOrder', authRequired(['USER']), placeOrder);
router.post('/orders/:orderId/:userType/cancel', authRequired(['USER']), cancelOrder);
router.post('/orders/:orderId/complete', authRequired(['USER']), completeOrder);

export default router;
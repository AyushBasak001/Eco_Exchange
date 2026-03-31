import express from 'express';
import {
    manageProducts,
    manageOrders,
    manageModeratorProfile,
    showOrderDetails,
    changeProductStatus,
    changeOrderStatus,
    editModeratorAddress
} from '../controllers/moderatorController.js';

import {authRequired} from '../middlewares/auth.js'

const router = express.Router();

router.get('/products', authRequired(['MODERATOR']), manageProducts);
router.get('/orders', authRequired(['MODERATOR']), manageOrders);
router.get('/profile', authRequired(['MODERATOR']), manageModeratorProfile);

router.get('/orders/:orderId', authRequired(['MODERATOR']), showOrderDetails);

router.post('/products/:productId/status/:statusId', authRequired(['MODERATOR']), changeProductStatus);
router.post('/orders/:orderId/status/:statusId', authRequired(['MODERATOR']), changeOrderStatus);

router.post('/profile/address', authRequired(['MODERATOR']), editModeratorAddress);

export default router;
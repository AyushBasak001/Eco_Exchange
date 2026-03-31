import express from 'express';
import {
    manageUsers,
    manageProducts,
    manageOrders,
    manageAdminProfile,
    showOrderDetails,
    toggleUserStatus,
    changeProductStatus,
    changeOrderStatus,
    editAdminAddress
} from '../controllers/adminController.js';

import {authRequired} from '../middlewares/auth.js'

const router = express.Router();

router.get('/users', authRequired(['ADMIN']), manageUsers);
router.get('/products', authRequired(['ADMIN']), manageProducts);
router.get('/orders', authRequired(['ADMIN']), manageOrders);
router.get('/profile', authRequired(['ADMIN']), manageAdminProfile);


router.get('/orders/:orderId', authRequired(['ADMIN']), showOrderDetails);

router.post('/users/:userId/status', authRequired(['ADMIN']), toggleUserStatus);
router.post('/products/:productId/status/:statusId', authRequired(['ADMIN']), changeProductStatus);
router.post('/orders/:orderId/status/:statusId', authRequired(['ADMIN']), changeOrderStatus);
router.post('/profile/address', authRequired(['ADMIN']), editAdminAddress);

export default router;
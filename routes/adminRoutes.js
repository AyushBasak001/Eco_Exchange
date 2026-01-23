import express from 'express';
import {
    manageUsers,
    manageProducts,
    manageOrders,
    manageAdminProfile,
    editUser,
    editAdminAddress
} from '../controllers/adminController.js';

import {authRequired} from '../middlewares/auth.js'

const router = express.Router();

router.get('/users', authRequired(['ADMIN']), manageUsers);
router.get('/products', authRequired(['ADMIN']), manageProducts);
router.get('/orders', authRequired(['ADMIN']), manageOrders);
router.get('/profile', authRequired(['ADMIN']), manageAdminProfile);

router.post('/users/:userId', authRequired(['ADMIN']), editUser);
router.post('/profile/address', authRequired(['ADMIN']), editAdminAddress);

export default router;
import express from 'express';
import {
    renderAdminPage,
    manageUsers,
    manageProducts,
    manageOrders,
    manageAdminProfile,
    editAdminAddress
} from '../controllers/adminController.js';

import {authRequired} from '../middlewares/auth.js'

const router = express.Router();

router.get('/', authRequired(['ADMIN']), renderAdminPage);
router.get('/users', authRequired(['ADMIN']), manageUsers);
router.get('/products', authRequired(['ADMIN']), manageProducts);
router.get('/orders', authRequired(['ADMIN']), manageOrders);
router.get('/profile', authRequired(['ADMIN']), manageAdminProfile);

router.post('/profile/address', authRequired(['ADMIN']), editAdminAddress);

export default router;
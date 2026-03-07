import express from 'express';
import {
    manageModeratorProfile,
    editModeratorAddress
} from '../controllers/moderatorController.js';

import {authRequired} from '../middlewares/auth.js'

const router = express.Router();

router.get('/profile', authRequired(['MODERATOR']), manageModeratorProfile);

router.post('/profile/address', authRequired(['MODERATOR']), editModeratorAddress);

export default router;
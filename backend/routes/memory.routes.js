const express = require('express');
const {
    createMemory,
    mintMemory,
    redeemMemory,
    getMemoryDetails,
    getUserMemories,
    getMemoryMinters,
    getCreatedMemories,
    uploadMemoryImage
} = require('../controllers/memory.controller');
const { authenticate } = require('../utils/middleware');

const router = express.Router();

// Create a memory
router.post(
    '/',
    authenticate,
    createMemory
);

// Memory actions
router.post('/mint', authenticate, mintMemory);
router.patch('/:id/redeem', authenticate, redeemMemory);

// Memory data fetching
router.get('/user', authenticate, getUserMemories);
router.get('/created', authenticate, getCreatedMemories);
router.get('/:id', authenticate, getMemoryDetails);
router.get('/:id/minters', authenticate, getMemoryMinters);

module.exports = router;
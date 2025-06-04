const express = require('express');
const { login, getNonce } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', login);
router.get('/nonce', getNonce);

module.exports = router;
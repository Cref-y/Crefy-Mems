const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../models/user.model');
const { JWT_CONFIG } = require('../config/auth');

exports.login = async (req, res) => {
    const { message, signature, address } = req.body;

    console.log('Login attempt:', { message, signature, address });

    // Validate required fields
    if (!message || !signature || !address) {
        console.log('Missing required fields');
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['message', 'signature', 'address']
        });
    }

    // Validate address format
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        console.log('Invalid address format:', address);
        return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        console.log('recoveredAddress', recoveredAddress);
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        let user = await User.findOne({ wallet_address: address });
        console.log('user', user);
        if (!user) {
            user = await User.create({ wallet_address: address });
        }

        const token = jwt.sign({ sub: address }, JWT_CONFIG.secret, {
            expiresIn: JWT_CONFIG.expiresIn
        });

        res.json({
            token,
            user: {
                wallet_address: user.wallet_address,
                created_at: user.created_at
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

exports.getNonce = (req, res) => {
    const nonce = Math.floor(Math.random() * 100000000).toString();
    res.json({ nonce });
};
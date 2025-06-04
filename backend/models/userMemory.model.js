const mongoose = require('mongoose');

const UserMemorySchema = new mongoose.Schema({
    memory_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Memory',
        required: true
    },
    owner_wallet: {
        type: String,
        ref: 'User',
        required: true
    },
    token_id: { type: Number, required: true },
    status: {
        type: String,
        enum: ['minted', 'redeemed', 'expired'],
        default: 'minted'
    },
    tx_hash: { type: String, required: true },
    minted_at: { type: Date, default: Date.now },
    redeemed_at: { type: Date }
});

module.exports = mongoose.model('UserMemory', UserMemorySchema);
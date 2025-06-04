const Memory = require('../models/memory.model');
const UserMemory = require('../models/userMemory.model');
const { generateQR } = require('../services/qr.service');
const upload = require('../utils/fileUpload');

// Add this middleware to your routes
exports.uploadMemoryImage = upload.single('image');

exports.createMemory = async (req, res) => {
    const { title, description, is_redeemable, max_mints, image_url } = req.body;
    const creator_wallet = req.user.sub;


    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        // const qr_code = await generateQR(creator_wallet);

        const memory = await Memory.create({
            creator_wallet,
            title,
            description,
            // qr_code,
            image_url,
            is_redeemable: is_redeemable !== false,
            max_mints: max_mints || 1
        });

        // Then generate QR code with the memory ID
        const qr = await generateQR(memory._id.toString());

        // Update memory with QR code
        memory.qr_code = qr.content;
        memory.qr_image = qr.image;
        await memory.save();

        console.log("Memory created with image URL:", image_url);
        res.json(memory);
    } catch (err) {
        console.error('Create memory error:', err);

        // Clean up uploaded file if there was an error
        if (req.file) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting uploaded file:', unlinkErr);
            });
        }

        res.status(500).json({ error: 'Memory creation failed' });
    }
};
exports.mintMemory = async (req, res) => {
    const { qr_code } = req.body;
    const minter_wallet = req.user.sub;

    if (!qr_code) {
        return res.status(400).json({ error: 'QR code is required' });
    }

    try {
        // Extract memory ID from QR code content
        if (!qr_code.startsWith('memory:')) {
            console.log("Qrcode does not start with memory:", qr_code);
            return res.status(400).json({ error: 'Invalid memory QR code' });
        }

        const memoryId = qr_code.split(':')[1];

        // Find memory by ID
        const memory = await Memory.findById(memoryId);
        if (!memory) {
            return res.status(404).json({ error: 'Memory not found' });
        }

        // Check if already minted
        const existingMint = await UserMemory.findOne({
            memory_id: memory._id,
            owner_wallet: minter_wallet
        });

        if (existingMint) {
            return res.status(400).json({ error: 'Already minted this memory' });
        }

        // Generate a unique token ID (you might want to use a better ID generation strategy)
        const token_id = Date.now(); // Using timestamp as token ID for simplicity

        // Create mint record
        const userMemory = await UserMemory.create({
            memory_id: memory._id,
            owner_wallet: minter_wallet,
            token_id: token_id, // Now providing the required token_id
            tx_hash: `simulated-tx-${Date.now()}`,
            status: 'minted'
        });

        // Update memory's current mints count
        memory.current_mints += 1;
        await memory.save();

        res.status(201).json({
            success: true,
            memory: {
                id: memory._id,
                title: memory.title,
                image_url: memory.image_url,
                token_id: userMemory.token_id // Return the actual token_id
            }
        });
    } catch (err) {
        console.error('Mint error:', err);
        res.status(500).json({ error: 'Minting failed' });
    }
};
exports.redeemMemory = async (req, res) => {
    const { id } = req.params;
    const { minter_wallet } = req.body;
    const creator_wallet = req.user.sub;

    try {
        // 1. Verify memory belongs to creator
        const memory = await Memory.findOne({
            _id: id,
            creator_wallet
        });

        if (!memory) {
            return res.status(404).json({ error: 'Memory not found' });
        }

        // 2. Find and update mint record
        const updated = await UserMemory.findOneAndUpdate(
            {
                memory_id: id,
                owner_wallet: minter_wallet,
                status: 'minted'
            },
            {
                status: 'redeemed',
                redeemed_at: new Date()
            },
            { new: true }
        );

        if (!updated) {
            return res.status(400).json({ error: 'No mint record found or already redeemed' });
        }

        res.json({
            success: true,
            memory_id: id,
            status: 'redeemed'
        });
    } catch (err) {
        console.error('Redeem error:', err);
        res.status(500).json({ error: 'Redemption failed' });
    }
};


// Get all memories minted by current user
exports.getUserMemories = async (req, res) => {
    const wallet_address = req.user.sub;

    try {
        const memories = await UserMemory.find({ owner_wallet: wallet_address })
            .populate('memory_id', 'title description image_url is_redeemable')
            .sort({ minted_at: -1 });

        res.json(memories.map(m => ({
            id: m.memory_id._id,
            title: m.memory_id.title,
            description: m.memory_id.description,
            image_url: m.memory_id.image_url,
            status: m.status,
            minted_at: m.minted_at,
            redeemed_at: m.redeemed_at
        })));
    } catch (err) {
        console.error('Get user memories error:', err);
        res.status(500).json({ error: 'Failed to fetch memories' });
    }
};

// Get all memories created by current user
exports.getCreatedMemories = async (req, res) => {
    const creator_wallet = req.user.sub;

    try {
        const memories = await Memory.find({ creator_wallet })
            .sort({ created_at: -1 });

        // Get mint counts for each memory
        const memoriesWithStats = await Promise.all(
            memories.map(async memory => {
                const stats = await UserMemory.aggregate([
                    { $match: { memory_id: memory._id } },
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ]);

                return {
                    ...memory.toObject(),
                    stats: stats.reduce((acc, curr) => {
                        acc[curr._id] = curr.count;
                        return acc;
                    }, {})
                };
            })
        );

        res.json(memoriesWithStats);
    } catch (err) {
        console.error('Get created memories error:', err);
        res.status(500).json({ error: 'Failed to fetch created memories' });
    }
};

// Get memory details
exports.getMemoryDetails = async (req, res) => {
    const { id } = req.params;
    const wallet_address = req.user.sub;

    try {
        const memory = await Memory.findById(id);
        if (!memory) {
            return res.status(404).json({ error: 'Memory not found' });
        }

        // Check if user has minted this memory
        const userMemory = await UserMemory.findOne({
            memory_id: id,
            owner_wallet: wallet_address
        });

        res.json({
            ...memory.toObject(),
            user_status: userMemory ? userMemory.status : null
        });
    } catch (err) {
        console.error('Get memory error:', err);
        res.status(500).json({ error: 'Failed to fetch memory' });
    }
};

exports.getMemoryMinters = async (req, res) => {
    const { id } = req.params;
    const creator_wallet = req.user.sub;

    try {
        const memory = await Memory.findOne({
            _id: id,
            creator_wallet
        });

        if (!memory) {
            return res.status(404).json({ error: 'Memory not found' });
        }

        const minters = await UserMemory.find({ memory_id: id })
            .populate('owner_wallet', 'wallet_address -_id');

        res.json(minters);
    } catch (err) {
        console.error('Get minters error:', err);
        res.status(500).json({ error: 'Failed to fetch minters' });
    }
};
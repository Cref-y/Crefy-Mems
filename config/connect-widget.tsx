import { inAppWallet, createWallet } from "thirdweb/wallets";

const customeWallets = [
    inAppWallet(
        {
            auth: {
                options: ["google", "x", "apple", "discord"],
            },
        }
    ),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("io.rabby"),
    createWallet("io.zerion.wallet"),
];

export default customeWallets;
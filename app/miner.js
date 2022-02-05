const Transaction = require("../wallet/transaction");
const Wallet = require(`../wallet`)


class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine() {
        const validTransactions = this.transactionPool.validTransactions();
        // Include a reward for the miner = 22
        // Create a block consisting of valid transactions = 26
        // Sync chains in p2pserver = 27
        // Clear the transaction pool = 28
        // Broadcast to every miner to clear their transaction pools = 29


        validTransactions.push(
            Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
        )

        const block = this.blockchain.addBlock(validTransactions)
        this.p2pServer.syncChains()
        this.transactionPool.clear()
        this.p2pServer.broadcastClearTransactions()

        return block
    }
}

module.exports = Miner;
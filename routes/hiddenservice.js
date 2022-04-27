const express = require(`express`);
const bodyParser = require(`body-parser`);
const Blockchain = require(`../blockchain`);
const P2pServer = require(`../app/p2p-server`);
const Wallet = require(`../wallet`);
const TransactionPool = require("../wallet/transaction-pool");
const Miner = require(`../app/miner`);
const router = express.Router()
const LocalStorage = require('node-localstorage').LocalStorage;

require(`dotenv/config`)

const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp); 
const miner = new Miner(bc, tp, wallet, p2pServer)

if (typeof localStorage === "undefined" || localStorage === null) {
    localStorage = new LocalStorage('./scratch');
}

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))
// Access address by .../h/blocks

router.get(`/blocks`, (req, res) => {
    p2pServer.syncChains()
    res.json(bc.chain); // Send result as JSON
})

router.post(`/mine`, (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`); 

    p2pServer.syncChains(); // To get the longest chain on connected devices in the port

    res.redirect(`/h/blocks`);
})

router.post(`/transact`, (req, res) => {
    let {recipient, amount} = req.body

    if (recipient !== null && amount !== null) {
        const transaction = wallet.createTransaction(recipient, amount, bc, tp)
        p2pServer.broadcastTransaction(transaction)
        // res.json(tp.transactions)
        res.redirect(`/h/mine-transactions`)
    } else {
        res.json({ "Error message": "Recipient address and amount is not valid"})
    }
    recipient = null, amount = null; // To avoid other people transfer to previous' address!
})

router.get(`/mine-transactions`, (req, res) => {
    const block = miner.mine()
    console.log(`New block added: ${block.toString()}`)
    res.redirect(`/h/blocks`)

    p2pServer.syncChains()
})

router.get('/new-wallet', (req, res) => {
    res.json({publicKey: wallet.publicKey})
})

module.exports = router
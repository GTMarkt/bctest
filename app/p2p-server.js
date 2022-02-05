const Websocket = require(`ws`);

const P2P_PORT = process.env. P2P_PORT || 5001; // Define port

// Each connected peers info will be inserted in array
const peers = process.env.peers ? process.env.peers.split(`,`) : []; 
const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transaction: `CLEAR_TRANSACTIONS`
}

class P2pServer {
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.sockets = [];
        this.transactionPool = transactionPool;
    }

    listen() {
        // Set port on (listening on peer-to-peer port 5001)
        const server = new Websocket.Server({port: P2P_PORT});

        // In time on `connection`, socket variable will be passed 
        // into function connectSocket, to action if a socket peer detected
        server.on(`connection`, socket => this.connectSocket(socket));
        
        this.connectToPeers();
        
        console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);
    }

    // Establish connection on each connected devices in our listening port
    connectToPeers() {
        peers.forEach(peer => {
            const socket = new Websocket(peer);
            //  If a socket port state is open, it will be pushed to connectSocket
            socket.on(`open`, () => this.connectSocket(socket));
        })
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log(`Socket connected`);
    
        // TO handle all sockets that go through this function
        this.messageHandler(socket);
        this.sendChain(socket)
    }

    messageHandler(socket) {
        socket.on(`message`, message => {
            const data = JSON.parse(message);
            switch(data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction)
                    break; 
                case MESSAGE_TYPES.clear_transaction:
                    this.transactionPool.clear()
                    break;
            }
        })
    }

    syncChains() {
        this.sockets.forEach(socket => this.sendChain(socket))
    }

    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain
        }))
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction
        }))
    }

    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction))
    }

    broadcastClearTransactions() {
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transaction
        })))
    }
}

module.exports = P2pServer;

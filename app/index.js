// heroku= fegic17743@viemery.com:fegic17743@viemery.com
const express = require(`express`);
const bodyParser = require(`body-parser`);
const Blockchain = require(`../blockchain`);
const P2pServer = require(`./p2p-server`);
const Wallet = require(`../wallet`);
const TransactionPool = require("../wallet/transaction-pool");
const Miner = require(`./miner`)
const mongoose = require(`mongoose`)
const Schema = require(`../models/post`);
const LocalStorage = require('node-localstorage').LocalStorage;
// const session = require('express-session');
require(`dotenv/config`)
const HTTP_PORT = process.env.PORT || 3001;

const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp); 
const miner = new Miner(bc, tp, wallet, p2pServer)

app.set('view engine', 'ejs')
app.use(express.static(`public`))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect(process.env.DB_Conn, 
    {useNewUrlParser: true, useUnifiedTopology: true}, () => 
    console.log(`Connected to DB!`)
)
mongoose.connection.on('error', err => console.error.bind(console, `MongoDB connection error: `))

// Login
let login = require('../routes/login')
app.use(`/`, login)

//SignUp
let signup = require('../routes/signup')
app.use(`/signup`, signup)

if (typeof localStorage === "undefined" || localStorage === null) {
    localStorage = new LocalStorage('./scratch');
}

// Show the main section
app.get(`/index`, async (req, res) => {
    res.render(`index`, {
        bc, wallet, tp, miner, p2pServer, localStorage
    })
    // console.log(`Current BuiltIn Generated Wallet : ${JSON.stringify(wallet.toString())}`)
})

// To update value
app.put(`/update/:publickey/:amount`, async (req, res) => {
    var amount = parseInt(req.params.amount),
        address = req.params.publickey

    await Schema.findByIdAndUpdate({ publicKey: address}, {ownedCoin: amount}, {new: true}, (err, result) => {
        if (err) console.error(err)
        
        if (result > 0 || result !== null || result !== undefined) {
            localStorage.setItem('accAmount', result.ownedCoin)
            // req.session.accAmount = result.ownedCoin
            console.log(`Changing amount of user ${result.username} to ${result.ownedCoin} success!`)
        } else if (result === 0 || result === null || result === undefined) {
            res.status(404).send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        .alert {
                            padding: 20px;
                            background-color: #f44336;
                            color: white;
                        }
                        .closebtn {
                            margin-left: 15px;
                            color: white;
                            font-weight: bold;
                            float: right;
                            font-size: 22px;
                            line-height: 20px;
                            cursor: pointer;
                            transition: 0.3s;
                        }
                        .closebtn:hover {color: black;}
                    </style>
                </head><body>
                    <div class="alert">
                        <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span> 
                        <strong>Alert!</strong> Backend transfer service is down, please try again later. No coins are taken
                    </div>
                </body></html>`)
        }
    })
})

// Fetch-POST APIs [AJAX]
app.use(`/h`, require(`../routes/hiddenservice`))

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`))
p2pServer.listen(); // Call to invoke listen()

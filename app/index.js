const express = require(`express`);
const bodyParser = require(`body-parser`);
const Blockchain = require(`../blockchain`);
const P2pServer = require(`./p2p-server`);
const Wallet = require(`../wallet`);
const TransactionPool = require("../wallet/transaction-pool");
const Miner = require(`./miner`)
const mongoose = require(`mongoose`)
const Schema = require(`../models/post`);

require(`dotenv/config`)
const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp); // Push chain to P2pServer
const miner = new Miner(bc, tp, wallet, p2pServer)

app.set('view engine', 'ejs')
app.use(express.static(`public`))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // To send as formdata, wwwx, etc.

mongoose.connect(process.env.DB_Conn, 
    {useNewUrlParser: true, useUnifiedTopology: true}, () => 
    console.log(`Connected to DB!`)
)
const db = mongoose.connection

db.on('error', err => console.error.bind(console, `MongoDB connection error: `))

// Signup page
app.get(`/signup`, (req, res) => {
    res.render(`signup`)
})

// Signup submission
app.post(`/signup`, async (req, res) => {
    let email = req.body.email,
        username = req.body.username,
        password = req.body.password,
        witness = req.body.witness,
        ownedCoin = 100
    
    const userData = new Schema({
      email:  email.toLowerCase(),
      username: username.toLowerCase(),
      password: password,
      witness: witness,
      ownedCoin: ownedCoin,
      publicKey: wallet.publicKey  
    })

    await Schema.findOne({username: username}, function (err, user) {
        if (err) console.error(`Validating new user is error:`, err)
    })
    .clone()
    .then((result) => {
        if (result || result > 0 || result !== null ) {
            res.status(406).send(`<h2>Your account <strong>username</strong> and/or <strong>email</strong> has been used before</h2>`)
        } else {
            if (checkPassword(password)) {
                userData.save()
                .then((result) => 
                    res.status(200).json({
                            message: 'Your profile created! Go login to http://localhost:3001/',
                            accountUsername: result.username,
                            coinOwned: result.ownedCoin
                    })
                )
                console.log(`A new user registered now!`) 
            } else {
                res.status(406)
                    .json({errorMessage: "YOUR password does NOT containing either :8 letters minimum, a symbol, an uppercase, a lowercase and a number. Go back to signup page again in 5 seconds. Go back to previous page!"})
                
                console.log(checkPassword(password))
            }
        }
    })
    
})

// Login page
app.get(`/`, async (req, res) => {
    res.status(200).render('login')
})

// Login submission
app.post(`/`, async (req, res) => {
    const { username, password } = req.body

    await Schema.findOne({username: username.toLowerCase()}, function (err, user) {
        if (err) console.error("SCHEMA LOGIN ERROR: ",err)

        if(!user || user < 1 || user == null || user == undefined) console.error(`User is not found!`)
        else{
            user.validatePassword(password).then((isMatch) => {
                if (isMatch == true) {
                    if (localStorageCheck()) {
                        localStorage[`username`] = username;
                        localStorage[`password`] = password;
                        res.redirect(`/home`)
                        console.log(`Localstorage is`,storageAvailable('localStorage'));
                    }
                    else {
                        res.status(404).send(`Local Storage is not available and found in your current browser!`)
                    }
                    console.log(`Account is exist and password insertion is`, isMatch)
                } else if(isMatch == false) {
                    // Print wrong password, limit the login to 3 times and lock it
                    // if (falseLogin < 3 && falseLogin >= 0) {
                    //     res.send(`Either username or password is wrong, please re-check!`)
                    //     falseLogin +=1;
                    // } else {
                    //     banned = true
                    //     res.send(`Account suspended for suspicious activity! Please contact administrator: @myContact123`)
                    //     return
                    // }

                    console.log(`Account suspended for suspicious activity! Please contact administrator`)
                    return res.redirect(`/`)
                } else {
                    res.send(`We couldn't identify your account, please reconfirm your account or try to register a new one!`)
                    console.log(`No matching account! : `,isMatch)
                }
            })
            
        }
    }).clone()
})

// Show the main section
app.get(`/home`, async (req, res) => {
    if(storageAvailable('localStorage')) {
        await Schema.findOne({username: localStorage['username'], password: localStorage['password']}, function (err, result) {
            if (err) console.log(err);
            if (result) {
                res.render(`index`, {
                    bc, chain: bc.chain,
                    wallet, tp, miner, p2pServer
                })
            } else {
                res.redirect(`/login`)
            }
        })
    }
})

// All below is API requests (AJAX)
app.get(`/blocks`, (req, res) => {
    res.json(bc.chain); // Send result as JSON
})

app.post(`/mine`, (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`); 

    p2pServer.syncChains(); // To get the longest chain on connected devices in the port

    res.redirect(`/blocks`);
})

app.get(`/transactions`, (req,res) => {
    res.json(tp.transactions)
})

app.post(`/transact`, (req, res) => {
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient, amount, bc, tp)
    p2pServer.broadcastTransaction(transaction)
    res.redirect(`/transactions`)
})

app.get(`/mine-transactions`, (req, res) => {
    const block = miner.mine()
    console.log(`New block added: ${block.toString()}`)
    res.redirect(`/blocks`)
})

app.get(`/public-key`, (req, res) => {
    res.json({ publicKey: wallet.publicKey})
})

function localStorageCheck(){
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}

function checkPassword(str)
{
    var re = /^(?=.*\d)(?=.*[!@#$%^_&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(str);
    // Minimum 8 characters
    // Has symbols of !@#$%^_&*
    // Has alphanum (capital, lowercase and numver)
}

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`))
p2pServer.listen(); // Call to invoke listen()


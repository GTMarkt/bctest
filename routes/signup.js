const express = require("express");
const router = express.Router()
const bodyParser = require(`body-parser`);
const mongoose = require(`mongoose`)

const app = express();
const Schema = require(`../models/post`);
const Wallet = require(`../wallet`)
const wallet = new Wallet()

require(`dotenv/config`)

app.set('view engine', 'ejs')
app.use(express.static(`../public`))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // To send as formdata, wwwx, etc.

mongoose.connect(process.env.DB_Conn, 
    {useNewUrlParser: true, useUnifiedTopology: true}, () => 
    console.log(`SignUp JS : Connected to DB!`)
)
mongoose.connection.on('error', err => console.error.bind(console, `MongoDB connection error: `))

router
    .route(`/`)
    .get((req, res) => {
        res.render(`signup`)
    })
    .post(async (req, res) => {
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

        await Schema
            .findOne({username: username}, function (err, user) {
                if (err) console.error(`Validating new user is error:`, err)
            })
            .clone()
            .then((result) => {
                if (result || result > 0 || result !== null ) {
                    res.status(406).send(`<h2>Your account <strong>username</strong> and/or <strong>email</strong> has been used before</h2>`)
                } else {
                    if (checkPassword(password)) {
                        userData
                            .save()
                            .then((result) => 
                                res.status(200).json({
                                        message: 'Your profile created! Go login to http://localhost:3001/',
                                        accountUsername: result.username,
                                        coinOwned: result.ownedCoin
                                })
                            )
                        console.log(`A new user registered now!`) 
                    } else {
                        res
                            .status(406)
                            .json({errorMessage: "YOUR password does NOT containing either :8 letters minimum, a symbol, an uppercase, a lowercase and a number. Go back to signup page again in 5 seconds. Go back to previous page!"})
                        
                        console.log(checkPassword(password))
                    }
                }
            })
    })

function checkPassword(str){
    var re = /^(?=.*\d)(?=.*[!@#$%^_&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(str);
    // Minimum 8 characters
    // Has symbols of !@#$%^_&*
    // Has alphanum (capital, lowercase and numver)
}

module.exports = router
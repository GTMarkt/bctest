const express = require(`express`);
const bodyParser = require(`body-parser`);
const mongoose = require(`mongoose`)
const session = require('express-session')
const LocalStorage = require('node-localstorage').LocalStorage;
const Schema = require(`../models/post`);
const ChainUtil = require('../chain-util');
const router = express.Router();
const app = express();

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'anyone'
}))
app.set('view engine', 'ejs')
app.use(express.static(`public`))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // To send as formdata, wwwx, etc.

mongoose.connect(process.env.DB_Conn, 
    {useNewUrlParser: true, useUnifiedTopology: true}, () => 
    console.log(`Login.js : Connected to DB!`)
)
mongoose.connection.on('error', err => console.error.bind(console, `MongoDB connection error: `))

router
    .route(`/`)
    .get((req, res) =>{
        res.status(200).render('login')
    })
    .post(async (req, res) => {
        const { username, password } = req.body

        await Schema.findOne({username: username.toLowerCase()}, function (err, result) {
            if (err) console.error("SCHEMA LOGIN ERROR: ",err)

            if(!result || result < 1 || result == null || result == undefined) {
                console.error(`User is not found!`)
                return res.status(404).send(`Inserted credentials: Username or Password does not match! Return to <a href="/">Login Page</a>`)
            } else{
                result.validatePassword(password).then((isMatch) => {
                    if (isMatch == true) {
                        if (typeof localStorage === "undefined" || localStorage === null) {
                            localStorage = new LocalStorage('./scratch');
                        }

                        localStorage.setItem('username', username)
                        localStorage.setItem('public-key', result.publicKey)
                        localStorage.setItem('accAmount', result.ownedCoin)
                        
                        // req.session.user = {
                        //     username : username,
                        //     publicKey : result.publicKey,
                        //     privateKey : () => {
                        //         ChainUtil.genPrivKey(result.privateKey)
                        //     }
                        // }
                        // req.session.username = "123asd";
                        // req.session.publicKey = result.publicKey;
                        // req.session.privateKey = ChainUtil.genPrivKey(result.privateKey)
                        // req.session.save()
                        
                        // console.log(req.session)
                        
                        return res.redirect(`/index`)
                    } else if(isMatch == false) {
                        return res.redirect(`/`)
                    }
                })
            }
        }).clone()
    })

module.exports = router
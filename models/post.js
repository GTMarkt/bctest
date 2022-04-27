const mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    saltFactor = 10;

const scheme = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        maxLength: 50
    },
    password: {
        type: String,
        required: true
    },
    publicKey: {
        type: String,
        unique: true
    },
    witness: Boolean,
    dateJoin: {
        type: Date,
        default: Date().toString()
    },
    ownedCoin: Number
})

scheme.pre('save', async function save(next) {
    if (!this.isModified('password')) return next();
    try {
      const salt = await bcrypt.genSalt(saltFactor)
      this.password = await bcrypt.hash(this.password, salt);
      return next();
    } catch (err) {
      return next(err);
    }
  });
  
scheme.methods.validatePassword = async function validatePassword(data) {
    return bcrypt.compare(data, this.password);
};

module.exports = mongoose.model(`User_Database`, scheme)
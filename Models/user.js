const mongoose = require("mongoose");
const {Schema} = mongoose;
const passportLocalMongoose = require('passport-local-mongoose').default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})
userSchema.plugin(passportLocalMongoose);

//passportLocalMongooseが、勝手にusernameとpasswordをスキーマに追加してくれる！


module.exports = mongoose.model("User", userSchema)

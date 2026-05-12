const express = require("express")
const router = express.Router();
const passport = require("passport")

const {storeReturnTo} = require("../middleware")

//コントローラー
const users = require("../controllers/users")


router.route("/register")
    .get(
        users.renderNewForm)
    .post(
        users.createUser)

router.route("/login")
    .get(
        users.renderLoginForm)
    .post(
        storeReturnTo, 
        passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), 
        users.login)

router.route("/logout")
    .get(
        users.logout)

module.exports = router
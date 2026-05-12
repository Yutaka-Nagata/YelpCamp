// レビューの作成
const express = require("express")
const router = express.Router({mergeParams: true})
const wrapAsync = require("../Utils/catchAsync")
//ミドルウェア
const {check_isLoggedIn, check_ReviewValidate, check_isReviewAuther} = require("../middleware")

//コントローラー
const reviews = require("../controllers/reviews")


router.route("/")
    .post(
        check_isLoggedIn, 
        check_ReviewValidate, 
        wrapAsync(reviews.createReview))

router.route("/:reviewId")
    .delete(
        check_isLoggedIn, 
        check_isReviewAuther, 
        wrapAsync(reviews.deleteReview))


module.exports = router
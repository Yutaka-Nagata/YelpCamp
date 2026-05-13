const express = require("express")
const router = express.Router()
const wrapAsync = require("../Utils/catchAsync")
const multer = require("multer")
const {storage} = require("../cloudinary/index")
const upload = multer({storage})

//ミドルウェア
const {check_isLoggedIn, check_isAuther, check_CampgroundValidate} = require("../middleware")

//コントローラー
const campgrounds = require("../controllers/campgrounds")



// 以下ルーティング

router.route("/")
    .get(
        wrapAsync(campgrounds.renderIndex))
    .post(
        check_isLoggedIn, 
        upload.array("Image"),
        check_CampgroundValidate, 
        wrapAsync(campgrounds.createCampground))

router.route("/new")
    .get(
        check_isLoggedIn, 
        campgrounds.renderNewForm)


router.route("/:id")
    .get(
        wrapAsync(campgrounds.renderDetail))
    .patch(
        check_isLoggedIn, 
        check_isAuther, 
        upload.array("Image"),
        check_CampgroundValidate, 
    wrapAsync(campgrounds.patchCampground))
    .delete(
    check_isLoggedIn, 
    check_isAuther, 
    wrapAsync(campgrounds.deleteCampground))




router.route("/:id/edit")
    .get( 
        check_isLoggedIn ,
        check_isAuther, 
        wrapAsync(campgrounds.renderEditForm))


module.exports = router
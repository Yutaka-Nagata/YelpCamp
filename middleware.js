const AppError = require("./Utils/AppError")
const {campgroundSchema, reviewSchema} = require("./Utils/joiSchemas")
const Campground = require("./Models/campground")
const Review = require("./Models/review")

module.exports.check_isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        //元々リクエストした場所を保存しておく
        // console.log("originalURL",req.originalUrl)
        req.session.returnTo = req.originalUrl
        req.flash("error", "ログインしてください")
        return res.redirect("/login")
    }
    return next()
}

module.exports.storeReturnTo = (req,res,next)=>{
    // console.log(req.session.returnTo)
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo;
    }
    return next()
}

module.exports.check_isAuther = async (req,res,next) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp.auther.equals(req.user._id)){
        req.flash("error", "アクションの権限がありません")
        return res.redirect(`/campgrounds/${id}`)
    }
    return next()
}

module.exports.check_isReviewAuther = async (req,res,next) => {
    const {reviewId, id} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.auther.equals(req.user._id)){
        req.flash("error", "アクションの権限がありません")
        return res.redirect(`/campgrounds/${id}`)
    }
    return next()
}

module.exports.check_CampgroundValidate = (req, res, next) => {
    const result = campgroundSchema.validate(req.body)
    if(result.error) throw new AppError(result.error, 501)
    return next();
}

module.exports.check_ReviewValidate = (req, res, next) => {
    const result = reviewSchema.validate(req.body)
    // console.log(result)
    if(result.error) throw new AppError(result.error, 501)
    return next();
}
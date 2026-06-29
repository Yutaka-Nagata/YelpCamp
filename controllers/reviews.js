const Review = require("../Models/review")
const AppError = require("../Utils/AppError")
const Campground = require("../Models/campground")
const logger = require('#utils/logger')

module.exports.createReview = async(req, res)=>{
    const campground = await Campground.findById(req.params.id);
    // logger.log(req.params)
    const review = new Review(req.body.review)
    review.auther = req.user._id;
    await review.save();

    campground.reviews.push(review);
    await campground.save()
    req.flash("success", "レビューを登録しました！")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async(req, res)=>{
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}, )
    const review = await Review.findByIdAndDelete(reviewId);
    logger.log("レビューを削除！", review)
    req.flash("success", "レビューを削除しました！")
    res.redirect(`/campgrounds/${id}`)

}
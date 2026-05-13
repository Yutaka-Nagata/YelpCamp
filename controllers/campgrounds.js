const mongoose = require("mongoose")
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geoCodingService = mbxGeoCoding({ accessToken: process.env.MAPBOX_TOKEN });

const Campground = require("../Models/campground")
const AppError = require("../Utils/AppError")
const {cloudinary} = require("../cloudinary/index")

module.exports.renderIndex = async (req, res)=>{
    const search = req.query.search
    let campgrounds
    if(search){
        campgrounds = await Campground.find({title: {$regex: search, $options: "i"}});
    }
    else{
        campgrounds = await Campground.find({});
    }
    res.render("campgrounds/index", {campgrounds, search}) 
}

module.exports.createCampground = async (req, res, next)=>{
    //locationからgeoJsonを取得
    const campground = new Campground(req.body)
    const GeoCode = await geoCodingService.forwardGeocode({
    query: campground.location,
    limit: 1
    })
    .send()
    campground.geometry = GeoCode.body.features[0].geometry;
    if(req.user) campground.auther = req.user._id;
    campground.Images = req.files.map(file => ({url: file.path, filename: file.filename}))
    await campground.save();

    req.flash("success", "新しいキャンプ場を登録しました！")
    console.log("POST", campground);
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.renderNewForm = (req, res)=>{
    res.render("campgrounds/new")
}

module.exports.renderEditForm = async (req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash("error", "キャンプ場が存在しません");
        return res.redirect("/campgrounds")
        
    }
    res.render("campgrounds/edit", {campground})
}


module.exports.renderDetail = async (req, res, next)=>{
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('ページが見つかりません', 404));
    }
    const campground = await Campground.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "auther"//レビューの投稿者をpopulateする
            }
        }).populate("auther");
    if(!campground){
        req.flash("error", "キャンプ場が存在しません");
        return res.redirect("/campgrounds")
        
    }
    // console.log(`${campground.title}のレビュー：`,campground.reviews)
    res.render("campgrounds/detail", {campground})
}


module.exports.deleteCampground = async (req, res)=>{
    const {id} = req.params;

    const campground = await Campground.findById(id);
    for(let image of campground.Images){
        await cloudinary.uploader.destroy(image.filename)
    }
    await Campground.findByIdAndDelete(id);
    
    console.log("DELETE", campground)
    req.flash("success", "キャンプ場を削除しました！")
    res.redirect("/campgrounds")

}


module.exports.patchCampground = async (req, res, next)=>{
    const {id} = req.params;
    const {title, price, description, location} = req.body;
    const campground = await Campground.findByIdAndUpdate(id, {title, price, description, location}, {new: true, runValidators: true});
    const imgs = req.files.map(file => ({url: file.path, filename: file.filename}))
    campground.Images.push(...imgs)
    campground.save()
    console.log("deleteImages", req.body.deleteImages)
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({$pull: {Images: {filename: {$in: req.body.deleteImages}}}})
    }
    
    console.log("PATCH", campground)
    req.flash("success", "キャンプ場を更新しました！")
    res.redirect(`/campgrounds/${campground._id}`)
}
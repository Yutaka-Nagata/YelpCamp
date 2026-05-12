const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const Review = require("./review")

// 'https://res.cloudinary.com/da21pquye/image/upload/v1778313344/YelpCamp/sgtpxdwqd01tuu1elh4z.jpg'

const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual("thumbnail").get(function(){
    return this.url.replace("/upload", "/upload/w_200")
})

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    Images: [imageSchema],
    description: String,
    location: String,
    geometry: {
        type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: true
        },
        coordinates: {
        type: [Number],
        required: true
        }
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
    auther : {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});



campgroundSchema.post("findOneAndDelete", async function(campground){
    if(campground.reviews.length){
        const res = await Review.deleteMany({_id: {$in: campground.reviews}})
        console.log("mongooseのミドルウェア発動", res)
    }
})




const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;


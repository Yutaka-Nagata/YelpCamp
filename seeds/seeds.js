const mongoose = require("mongoose")
const Campground = require("../Models/campground")

// const MongoURL = process.env.DB_URL
// const localURL = 'mongodb://localhost:27017/yelpCamp'

// const URL = MongoURL || localURL
// mongoose.connect(URL, {
//     useNewUrlParser: true, 
//     useUnifiedTopology: true, 
//     useCreateIndex: true, 
//     useFindAndModify: false
// })
//     .then(() => {
//         console.log("MongoDBコネクションOK！")
//     }).catch(()=>{
//         console.log("コネクションエラー！")
//     });
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

//データベースを初期化する
module.exports.seedDB = async () =>{
    await Campground.deleteMany({})

    for(let i = 0; i < 50; i++){
        const randomPrice = Math.floor(Math.random() * 2000) + 1000;
        const randomCity = GetSumpleRandom(cities)
        const campground = new Campground({
            title: `${GetSumpleRandom(descriptors)}・${GetSumpleRandom(places)}`,
            price: randomPrice,
            description: "木曾路はすべて山の中である。あるところは岨づたいに行く崖の道であり、あるところは数十間の深さに臨む木曾川の岸であり、あるところは山の尾をめぐる谷の入り口である。一筋の街道はこの深い森林地帯を貫いていた。東ざかいの桜沢から、西の十曲峠まで、木曾十一宿はこの街道に添うて、二十二里余にわたる長い谿谷の間に散在していた。道路の位置も幾たびか改まったもので、古道はいつのまにか深い山間に埋もれた。",
            location: `${randomCity.prefecture} ${randomCity.city}`,
            geometry: {
                type: "Point",
                coordinates: [randomCity.longitude, randomCity.latitude]
            },
            auther: '69fd30515ad0699878018bf0'
        })
        await campground.save();
        
    }
}




function GetSumpleRandom(array){
    return array[Math.floor(Math.random() * array.length)];
}
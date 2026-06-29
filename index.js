require("dotenv").config()
const logger = require('#utils/logger')

//gitHub_flowの練習

const express = require("express")
const mongoose = require("mongoose")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")
const session = require("express-session")
const MongoStore = require("connect-mongo").default
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")

//オリジナルmodules
const User = require("./Models/user")
const AppError = require("./Utils/AppError")


//ルーティングの定義
const campgroundRoute = require("./routes/campgrounds")
const reviewRoute = require("./routes/reviews")
const usersRoute = require("./routes/users")

const MongoURL = process.env.DB_URL
const localURL = 'mongodb://localhost:27017/yelpCamp'

const URL = MongoURL || localURL
//DBサーバのの立ち上げ
mongoose.connect(URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true, 
    useFindAndModify: false
})
    .then(() => {
        logger.log("MongoDBコネクションOK！")
    }).catch((e)=>{
        logger.log("コネクションエラー！", e)
    });

const app = express()
app.engine("ejs", ejsMate)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(methodOverride("_method"))
app.use(express.urlencoded({extended : true}))//フォームから来たデータをパースする
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))



//セッション管理

const secret = process.env.SECRET || "mySecret"
const store = MongoStore.create({
    mongoUrl: URL,
    crypto: {
        secret
    },
    touchAfter: 24 * 3600//一定数秒sessionが変わってない場合、MongoDBにアクセスしない
})
store.on("error", e=>{
    logger.log("セッションストアエラー", e)
})
const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, //クッキーの有効期限を１週間にする
        httpOnly: true //JSからクッキーの値を取得できなくなる
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(helmet())


const scriptSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net',
    'https://kit.fontawesome.com',
    'https://ka-f.fontawesome.com'
];
const styleSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
    'https://api.mapbox.com',
    'https://*.tiles.mapbox.com',
    'https://events.mapbox.com',
    'https://ka-f.fontawesome.com'
    
];
const fontSrcUrls = [];
const imgSrcUrls = [
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
    'https://images.unsplash.com'
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'","'self'", ...scriptSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
            fontSrc: ["'self'", ...fontSrcUrls]
        }
    })
)


app.use(passport.initialize())
app.use(passport.session())
//passportセッションを呼ぶ前にsessionをapp.useしておくこと！
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
//ユーザーの情報を、どうやってセッションに入力したり、取り出したりするか

//flashを定義するミドルウェア
app.use((req,res,next)=>{
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    return next()
})

//現在のUser情報をres.localsに保存するミドルウェア
app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    return next()
})




//ルーティング
app.get("/", (req, res)=>{
    res.render("home");
})

app.use("/", usersRoute)
app.use("/campgrounds", campgroundRoute)
app.use("/campgrounds/:id/reviews", reviewRoute)


//エラールーティング
app.use((req, res, next)=>{
    const err = new AppError("ページが見つかりません", 404)
    logger.log("404:", req.originalUrl);
    next(err);
})

app.use((err, req, res, next)=>{
    const {status = 500, message = "不明なエラーが発生しました"} = err
    // logger.log(err.stack)
    res.status(status).render("error", {message})
})


const port = process.env.PORT || 3000

app.listen(port, (req,res)=>{
    logger.log(`ポート${port}で待機中...`)
})
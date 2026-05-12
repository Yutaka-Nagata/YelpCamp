const User = require("../Models/user")

module.exports.renderNewForm = (req,res)=>{
    res.render("users/register")
}

module.exports.createUser = async (req,res,next)=>{
    try{
        const {username, email, password} = req.body;
        const user = new User({email, username})
        const newUser = await User.register(user, password)
        
        req.login(newUser, function(err){
            if(err){
                return next(err)
            }
            req.flash("success", "YelpCampへようこそ！")
            res.redirect("/campgrounds")
        })
        
    }catch(e){
        req.flash("error", e.message)
        res.redirect("/register")
    }
    
}


module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login")
}


module.exports.login = (req,res)=>{
        req.flash("success", "おかえりなさい！")
        console.log("")
        const redirectUrl = res.locals.returnTo || "/campgrounds";
        delete req.session.returnTo;
        res.redirect(redirectUrl)

}


module.exports.logout = (req,res,next)=>{
    req.logout(function(err){
        if(err){
            return next(err);
        }
        req.flash("success", "ログアウトしました")

        res.redirect("/campgrounds")
    });
    
}


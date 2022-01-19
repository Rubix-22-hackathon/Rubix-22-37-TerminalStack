const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const upload = require("express-fileupload");
const fs = require('fs');
const hostname = '127.0.0.1';
const port = process.env.PORT || 3001;

const connection = require("./utils/dbconnection");
const publicDirectory = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);
app.use(express.static(publicDirectory));
app.use(express.json());
app.use(upload());

app.use(flash());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

//allow to access data from req
app.use(express.urlencoded({ extended: false }));


// Dr Details
const databasepath = path.join(__dirname, "./database/drdetails.json")
const loadDrDetails = () => {
    try {
        const dataBuffer = fs.readFileSync(databasepath);
        const dataJSON = dataBuffer.toString();
        return JSON.parse(dataJSON);
    } catch (e) {
        console.log("inside catch " + e);
        return [];
    }
}

// Medicine Details
const databasepathMed = path.join(__dirname, "./database/medicines.json")
const loadMedicineDetails = () => {
    try {
        const dataBufferMed = fs.readFileSync(databasepathMed);
        const dataJSONMed = dataBufferMed.toString();
        return JSON.parse(dataJSONMed);
    } catch (e) {
        console.log("inside catch " + e);
        return [];
    }
}


const listDoctor = (email) => {
    return new Promise((resolve, reject) => {
        const doctors = loadDrDetails();
        const doctor = doctors.find((dr) => dr.email === email);
        resolve(doctor);
    })
}

//using passport
const initializePassport = require("./utils/passportConfig");
initializePassport(passport, email => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM `userdetail` WHERE `email` = '" + email + "'";
        connection.query(sql, (err, rows) => {
            // console.log(rows[0]);
            resolve(rows[0]);
        })
    })
}, id => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM `userdetail` WHERE `id` = " + id + "";
        connection.query(sql, (err, rows) => {
            // console.log(rows[0]);
            resolve(rows[0]);
        })
    })
});


//ENDPOINTS
app.get('/', (req, res) => {
    if(req.user){
        if(req.user.status == "doctor"){
            return res.status(200).render('home',{
                name: req.user.name,
                showDrNav: true,
            })
        }else{
            return res.status(200).render('home',{
                name: req.user.name,
                showUserNav: true,
            })
        }
    }else{
        return res.status(200).render('home',{
            normalNav: true
        })
    }
    
})

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/userdashboard",
    failureRedirect: "/login",
    failureFlash: true,
}))

//user dashboard
app.get("/userdashboard", [checkAuthenticated, checkIsNotDoctor], (req, res) => {
    // console.log(req.user.status);
    
    res.render("userdashboard", {
        name: req.user.name,
    })
})
app.get("/drdashboard", [checkAuthenticated, checkIsDoctor], (req, res) => {
    // console.log(req.user.status);
    const dataa = listDoctor(req.user.email);
    console.log(dataa)

    res.render("drdashboard", {
        name: req.user.name,
        dataa,
    })

})

//patient signup
app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register")
})

const checkAlreayExist = (email) => {
    return new Promise((resolve, reject) => {
        let sql1 = "SELECT * FROM `userdetail` WHERE `email` LIKE '"+email+"' AND `status` LIKE 'patient'";
        connection.query(sql1, (err, rows)=>{
            if(rows.length > 0){
                reject();
            }else{
                resolve();
            }
        })
    })
}


app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        res.set({'Content-Type': 'application/json'});
        let name = req.body.name;
        let email = req.body.email;
        let password = req.body.password
        console.log(name+email+password)
        await checkAlreayExist(email);
        const sql = "INSERT INTO `userdetail` (`id`, `name`, `email`, `password`, `status`) VALUES (NULL, '" + name + "', '" + email + "', '" + password + "', 'patient');"
        connection.query(sql, (err, rows) => {
            if(!err){
                return res.send({
                    msg: "Account Created",
                });
            }else{
                res.redirect("/register");
            }
        })
    } catch (err){
        // console.log("inside catch");
        return res.send({
            msg: "Email already registered",
        });
    } 
})

app.get("/logout",checkAuthenticated, (req, res) => {
    req.logOut();
    console.log('Log out done');
    
    res.redirect("/");
})

// pages
app.get("/drList", [checkAuthenticated, checkIsNotDoctor], (req, res) => {
    const data = loadDrDetails();
    res.render("drList", {
        name: req.user.name,
        data
    })
})

app.get('/buymedicine', [checkAuthenticated, checkIsNotDoctor], (req, res) =>{
    const MedData = loadMedicineDetails();
    console.log(MedData);
    
    res.render('buyMedicine' , {name: req.user.name, MedData});
})

//middlewares
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

function checkIsDoctor(req, res, next) {
    if (req.user.status === "doctor") {
        return next();
    } else {
        res.redirect("/userdashboard");
    }
}
function checkIsNotDoctor(req, res, next) {
    if (req.user.status !== "doctor") {
        return next();
    } else {
        res.redirect("/drdashboard");
    }
}

// START THE SERVER
app.listen(port, () => {
    console.log(`Server is running at http://${hostname}:${port}/`)
})






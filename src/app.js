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
const bcrypt = require("bcrypt");

const server = require("http").Server(app);
const io = require('socket.io')(server);
const {v4: uuidv4} = require("uuid");

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
            resolve(rows[0]);
        })
    })
}, id => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM `userdetail` WHERE `id` = " + id + "";
        connection.query(sql, (err, rows) => {
            resolve(rows[0]);
        })
    })
});


//ENDPOINTS
app.get('/', (req, res) => {
    if (req.user) {
        if (req.user.status == "doctor") {
            return res.status(200).render('home', {
                name: req.user.name,
                showDrNav: true,
            })
        } else {
            return res.status(200).render('home', {
                name: req.user.name,
                showUserNav: true,
            })
        }
    } else {
        return res.status(200).render('home', {
            normalNav: true
        })
    }

})

app.get('/covid', (req, res) => {
    if (req.user) {
        if (req.user.status == "doctor") {
            return res.status(200).render('covid', {
                name: req.user.name,
                showDrNav: true,
            })
        } else {
            return res.status(200).render('covid', {
                name: req.user.name,
                showUserNav: true,
            })
        }
    } else {
        return res.status(200).render('covid', {
            normalNav: true
        })
    }

})

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/userdashboard",
    failureRedirect: "/",
    failureFlash: true,
}))

//user dashboard
app.get("/userdashboard", [checkAuthenticated, checkIsNotDoctor], (req, res) => {
    const sql = "SELECT * FROM `connections` WHERE `patientemail` LIKE '"+req.user.email+"'"
    const sqlVConnected = "SELECT * FROM `vconnection` WHERE `patientemail` LIKE '"+req.user.email+"' AND `status` LIKE 'connected'"
    let rowsVCdata_accpeted;
    connection.query(sqlVConnected, (err, rowsVC) => {
        rowsVCdata_accpeted = rowsVC;
    })
    // const data = await listDoctor(req.user.email);
    connection.query(sql, (err, rows) => {
        console.log(rows.length);
            if(rows.length == 0){
                res.render("userdashboard", {
                    name: req.user.name,
                    email: req.user.email,
                    message: "No connection req",
                    rowsVCdata_accpeted,
                })
            }else{
                res.render("userdashboard", {
                    name: req.user.name,
                    email: req.user.email,
                    rows,
                    rowsVCdata_accpeted,
                })
            }
        })
})

app.post("/accpetConnectReq", [checkAuthenticated, checkIsDoctor], (req, res) => {
    // console.log(req.user.email);
    // console.log(req.query.email);
    const sql = "UPDATE `connections` SET `status` = 'connected' WHERE `connections`.`dremail` = '"+req.user.email+"' AND `connections`.`patientemail` = '"+req.query.email+"';";
    connection.query(sql, (err, rows) => {
            if(err){
                res.redirect("/drdashboard");
            }else{
                res.redirect("/drdashboard");
            }
        })
})
app.post("/deleteConnectReqVC", [checkAuthenticated, checkIsDoctor], (req, res) => {
    // console.log(req.user.email);
    // console.log(req.query.email);
    const sql = "DELETE FROM `vconnection`  WHERE `vconnection`.`dremail` = '"+req.user.email+"' AND `vconnection`.`patientemail` = '"+req.query.email+"';";
    connection.query(sql, (err, rows) => {
            if(err){
                res.redirect("/drdashboard");
            }else{
                res.redirect("/drdashboard");
            }
        })
})
app.post("/deleteConnectReq", [checkAuthenticated, checkIsDoctor], (req, res) => {
    // console.log(req.user.email);
    // console.log(req.query.email);
    const sql = "DELETE FROM `connections`  WHERE `connections`.`dremail` = '"+req.user.email+"' AND `connections`.`patientemail` = '"+req.query.email+"';";
    connection.query(sql, (err, rows) => {
            if(err){
                res.redirect("/drdashboard");
            }else{
                res.redirect("/drdashboard");
            }
        })
})

app.post("/accpetConnectReqVC", [checkAuthenticated, checkIsDoctor], (req, res) => {
    // console.log(req.user.email);
    // console.log(req.query.email);
    const uid_vc = uuidv4();
    const sql = "UPDATE `vconnection` SET `status` = 'connected',`uuid` = '"+uid_vc+"' WHERE `vconnection`.`dremail` = '"+req.user.email+"' AND `vconnection`.`patientemail` = '"+req.query.email+"';";
    connection.query(sql, (err, rows) => {
            if(err){
                res.redirect("/drdashboard");
            }else{
                res.redirect("/drdashboard");
            }
        })
})

app.get("/drdashboard", [checkAuthenticated, checkIsDoctor], async (req, res) => {
    const sql = "SELECT * FROM `connections` WHERE `dremail` LIKE '"+req.user.email+"' AND `status` LIKE 'Request Sent'"
    const sqlC = "SELECT * FROM `connections` WHERE `dremail` LIKE '"+req.user.email+"' AND `status` LIKE 'connected'"
    const sqlV = "SELECT * FROM `vconnection` WHERE `dremail` LIKE '"+req.user.email+"' AND `status` LIKE 'Request Sent'"
    const sqlVConnected = "SELECT * FROM `vconnection` WHERE `dremail` LIKE '"+req.user.email+"' AND `status` LIKE 'connected'"
    let message;
    let connectionsReq;
    const data = await listDoctor(req.user.email);
    let rowsVCdata;
    let rowsVCdata_accpeted;
    let rows_accpeted;
    connection.query(sqlV, (err, rowsVC) => {
        rowsVCdata = rowsVC;
        })
    connection.query(sqlC, (err, rowsVC) => {
        rows_accpeted = rowsVC;
        })
    connection.query(sqlVConnected, (err, rowsVC) => {
        rowsVCdata_accpeted = rowsVC;
        })
    connection.query(sql, (err, rows) => {
        // console.log(rows.length);
            if(rows.length == 0){
                res.render("drdashboard", {
                    name: req.user.name,
                    message: "No connection req",
                    data,
                    rowsVCdata,
                    rowsVCdata_accpeted,
                    rows_accpeted
                })
            }else{
                res.render("drdashboard", {
                    name: req.user.name,
                    rows,
                    data,
                    rowsVCdata,
                    rowsVCdata_accpeted,
                    rows_accpeted
                })
            }
        })
        
    
})

//patient signup
app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register")
})

const checkAlreayExist = (email) => {
    return new Promise((resolve, reject) => {
        let sql1 = "SELECT * FROM `userdetail` WHERE `email` LIKE '" + email + "' AND `status` LIKE 'patient'";
        connection.query(sql1, (err, rows) => {
            if (rows.length > 0) {
                reject();
            } else {
                resolve();
            }
        })
    })
}


app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        res.set({ 'Content-Type': 'application/json' });
        let name = req.body.name;
        let email = req.body.email;
        let password = req.body.password
        // let password = await bcrypt.hash(req.body.password, 10);
        console.log(name + email + password)
        await checkAlreayExist(email);
        const sql = "INSERT INTO `userdetail` (`id`, `name`, `email`, `password`, `status`) VALUES (NULL, '" + name + "', '" + email + "', '" + password + "', 'patient');"
        connection.query(sql, (err, rows) => {
            if (!err) {
                return res.send({
                    msg: "Account Created",
                });
            } else {
                res.redirect("/");
            }
        })
    } catch (err) {
        // console.log("inside catch");
        return res.send({
            msg: "Email already registered",
        });
    }
})


const checkAlreayExistDr = (email) => {
    return new Promise((resolve, reject) => {
        let sql1 = "SELECT * FROM `drdetail` WHERE `email` LIKE '" + email + "'";
        connection.query(sql1, (err, rows) => {
            if (rows.length > 0) {
                reject();
            } else {
                resolve();
            }
        })
    })
}
app.post("/drregister", checkNotAuthenticated, async (req, res) => {
    const uploadpath = path.join(__dirname, "./uploads")
    console.log(uploadpath);
    // var file = req.files.file
    // console.log(file);
    var filename = 'null';
    try {
        await checkAlreayExistDr(req.body.email);
        const sql = "INSERT INTO `drdetail` (`id`, `fullname`, `email`, `speciality`, `qualification`, `experience`, `address`, `certificate`, `password`, `date`) VALUES (NULL, '" + req.body.fullname + "', '" + req.body.email + "', '" + req.body.speciality + "', '" + req.body.qualification + "', '" + req.body.experience + "', '" + req.body.address + "', '" + uploadpath + "/" + filename + "', '" + req.body.password + "', current_timestamp());"
        connection.query(sql, (erro, rows) => {
            // file.mv(uploadpath + "/" + filename, (error) => {
                return res.send({
                    msg: "Your account has been sent for verification",
                });
            // })
        })
    } catch (err) {
        return res.send({
            msg: err,
        });
    }
})

app.get("/logout", checkAuthenticated, (req, res) => {
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
app.get("/bookappointment", [checkAuthenticated, checkIsNotDoctor], async (req, res) => {
    // console.log("id " + req.query.email);
    const email = req.query.email;
    const data = await listDoctor(email);
    // console.log(data);
    const sql = "SELECT * FROM `connections` WHERE `dremail` LIKE '"+data.email+"' AND `patientemail` LIKE '"+req.user.email+"'"
    const sqlV = "SELECT * FROM `vconnection` WHERE `dremail` LIKE '"+data.email+"' AND `patientemail` LIKE '"+req.user.email+"'"
    let vNotConnect = false;
    let vReqSent = false;
    let vConnected = false;
    connection.query(sqlV, (erro, rows) => {
        if(rows.length == 0){
            vNotConnect = true;
            console.log(rows.length + " length ");
            
        }
        else if (rows[0].status == "Request Sent") {
            vReqSent = true;
            console.log(rows[0].status);
        }
        else if (rows[0].status == "connected") {
            vConnected = true;
        }
    })
    try{
        connection.query(sql, (erro, rows) => {
            // console.log(rows)
            if(rows.length == 0){
                return res.render("bookappointment", {
                    name: req.user.name,
                    data,
                    notConnected: true,
                    vNotConnect,
                    vReqSent,
                    vConnected
                })
            }
            if (rows[0].status == "Request Sent") {
                return res.render("bookappointment", {
                    name: req.user.name,
                    data,
                    rows,
                    reqSent: true,
                    vNotConnect,
                    vReqSent,
                    vConnected
                })
            }
            else if (rows[0].status == "connected") {
                return res.render("bookappointment", {
                    name: req.user.name,
                    data,
                    connected: true,
                    vNotConnect,
                    vReqSent,
                    vConnected
                })
            }
        })
    }catch(e){
        console.log("in catch"+e);
        res.redirect("/")
    }
})



app.post("/connReqUser", [checkAuthenticated, checkIsNotDoctor], (req, res) => {
    try {
        const dremail = req.body.dremail;
        console.log(dremail);
        let sql = "INSERT INTO `connections` (`id`, `dremail`, `patientemail`, `status`) VALUES (NULL, '" + dremail + "', '" + req.user.email + "', 'Request Sent');";
        connection.query(sql, (erro, rows) => {
            const url = "/bookappointment?email="+dremail;
            return res.redirect(url);
        })
    } catch (e) {
        console.log("some error occured")
        res.redirect("/");
    }
})

app.post("/connReqUserVC", [checkAuthenticated, checkIsNotDoctor], (req, res) => {
    try {
        const dremail = req.body.dremail;
        console.log(dremail);
        let sql = "INSERT INTO `vconnection` (`idVconnection`, `dremail`, `patientemail`, `status`) VALUES (NULL, '" + dremail + "', '" + req.user.email + "', 'Request Sent' );";
        console.log('Values inserted in Vconnection');
        
        connection.query(sql, (erro, rows) => {
            const url = "/bookappointment?email="+dremail;
            if(erro)
            {
                console.log(erro + 'Values NOT inserted in Vconnection');
            }
            return res.redirect(url);
        })
    } catch (e) {
        console.log("some error occured")
        res.redirect("/");
    }
})

app.get('/buymedicine', [checkAuthenticated, checkIsNotDoctor], (req, res) =>{
    const MedData = loadMedicineDetails();
    
    res.render('buyMedicine' , {name: req.user.name, MedData});
})

// Video-calling
app.get("/video-calling", (req,res) => {
    res.redirect(`/video-calling${uuidv4()}`)
});

app.get('/video-calling:room' , (req, res) =>{    
    res.render('room', { roomID : req.params.room})
})

io.on('connection', socket =>{
    socket.on('join-room', (roomID, userId)=>{
        console.log('Joined Room');
        socket.join(roomID);
        // socket.to(roomId).broadcast.emit('user-connected');
        socket.broadcast.to(roomID).emit('user-connected', userId);

        socket.on('message', message =>{
            io.to(roomID).emit('createMessage', message);
        })
    })
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
server.listen(port, () => {
    console.log(`Server is running at http://${hostname}:${port}/`)
})






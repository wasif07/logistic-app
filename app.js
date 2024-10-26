require('dotenv').config();
const express = require("express");
const validator = require("email-validator")
const fs = require('fs');
const { availableMemory } = require("process");
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

let ADMIN = []
let INQUIRY = []


try {
    ADMIN = JSON.parse(fs.readFileSync('admin.json','utf8'));
    //console.log(ADMIN);
    INQUIRY = JSON.parse(fs.readFileSync('inquiry.json','utf8'));

} catch {
    ADMIN = [];
    INQUIRY = [];
}

const secretKey = 'qwerty@1234'

const authenticateJwt = (req,res,next)=> {
    const authHeader = req.headers.authorization;
    if(authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, secretKey, (err, user)=> {
            if(err) {
                return res.sendStatus(401);
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401)
    }
  };

app.get('/', (req,res)=> {
    fs.readFile('admin.json','utf8',(err,data)=>{
        res.send(data);  
    });
})

app.post('/user/inquiry',(req,res) => {
    const {email, name, queryy} = req.body;
    const newInquiry = {email,name,queryy};
    if(newInquiry) {
        INQUIRY.push(newInquiry);
        fs.writeFileSync('inquiry.json',JSON.stringify(INQUIRY));
        res.json("We got a new inquiry");
    }
    else {
        res.json("Please check the details and send again")
    }

})

app.get('/admin/login', authenticateJwt, (req,res) => {
    //var fileinquiry = fs.readFileSync('inquiry.json','utf8');
    res.json(INQUIRY);
    
})

app.post('/admin/signup', (req,res)=> {
    const {email, password} = req.body;
    const emailVerify = validator.validate(req.body.email);
    console.log(emailVerify);    
    if(emailVerify === true) {
        const admin = ADMIN.find((t)=> t.email === email);
        if(admin) {
            res.status(403).json({message: 'Admin already exists'})
        } else {
            const newAdmin = {email,password};
            // console.log(typeof(newAdmin));
            ADMIN.push(newAdmin);
            const token = jwt.sign({email, role: 'admin'},secretKey,{expiresIn: '1h'});
    
            fs.writeFileSync('admin.json',JSON.stringify(ADMIN));
            res.json({message: "Admin created successfully", token });    
        } 
    }
    else {
        res.status(400).json({message: "Please enter valid email"})
    }
})

const port = process.env.PORT || 3000;

const serverStart = async() => {
    try {
        await console.log('DB is connected');
        app.listen(port, ()=> {
            console.log(`Server is listening on PORT ${port}...`);
    })
}
catch(err) {
    console.log("Error message is ->"+ err);
}
   
};
serverStart();
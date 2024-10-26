const express = require("express");
const PORT = 3000;
const fs = require('fs');
const { availableMemory } = require("process");

const app = express();
app.use(express.json());

let ADMIN = []

try {
    ADMIN = JSON.parse(fs.readFileSync('admin.json','utf8'));
    console.log(ADMIN);
    
} catch {
    ADMIN = [];
}

app.get('/', (req,res)=> {
    fs.readFile('admin.json','utf8',(err,data)=>{
        res.send(data);  
    });
})

app.post('/admin/signup', (req,res)=> {
    const {email, password} = req.body;
    const admin = ADMIN.find((t)=> t.email === email);
    if(admin) {
        res.status(403).json({message: 'Admin already exists'})
    } else {
        const newAdmin = {email,password};
        ADMIN.push(newAdmin);
        //console.log(typeof(ADMIN));
        fs.writeFileSync('admin.json',JSON.stringify(ADMIN));
        res.json("Admin created successfully")

    } 

    //res.send(email+" here you go "+password);
})

app.listen(PORT, ()=> {
    console.log(`Server is listening on PORT ${PORT}...`);
    
});


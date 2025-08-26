//=======[ Settings, Imports & Data ]==========================================
var PORT    = 3000;

var express = require('express')
var cors = require('cors')
const jwt = require('jsonwebtoken')

const routerDispositivos = require('./dispositivos/index')
const routerMediciones = require('./mediciones/index')
const routerElValvulas = require('./electrovalvulas/index')

var app = express();

const corsOptions = {
    // Solo para desarrollo
    origin: '*',
}


const YOUR_SECRET_KEY = 'mi llave'
var testUser = {username: 'test', password: '1234'}

app.use(cors(corsOptions))

// to parse application/json
app.use(express.json()); 
// to serve static files
app.use(express.static('/home/node/app/static/'));



//=======[ Main module code ]==================================================

var authenticator = function (req, res, next) {
    let autHeader = (req.headers.authorization || '')
    if (autHeader.startsWith('Bearer ')) {
        token = autHeader.split(' ')[1]
    } else {
        res.status(401).send({ message: 'Se requiere un token de tipo Bearer' })
    }
    jwt.verify(token, YOUR_SECRET_KEY, function(err) {
      if(err) {
        res.status(403).send({ message: 'Token inválido' })
      }
    })
    next()
}


app.post('/login', (req, res) => {
    if (req.body) {
        var userData = req.body

        if (testUser.username === userData.username && testUser.password === userData.password) {
            var token = jwt.sign(userData, YOUR_SECRET_KEY)
            res.status(200).send({
                signed_user: userData,
                token: token
            })
        } else {
            res.status(403).send({
                errorMessage: 'Auth required'
            })
        }
    } else {
        res.status(403).send({
            errorMessage: 'Se requiere un usuario y contraseña'
        })
    }
})

app.use(authenticator, routerDispositivos)
app.use(authenticator, routerMediciones)
app.use(authenticator, routerElValvulas)

app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});

//=======[ End of file ]=======================================================

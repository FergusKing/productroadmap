const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mime = require('mime-types')
const compression = require('compression')
const helmet = require('helmet')

//DEV REQUIRES
const logger = require('morgan')

//CONFIG
var app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'twig')
app.set('view cache', false)

app.use(helmet())
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname + '/public'), {
    setHeaders: function(res, path){
      var typeStr = mime.lookup(path);
      if(typeStr === 'image/gif' || typeStr === 'image/jpeg' || typeStr === 'image/png' || typeStr === 'image/svg+xml' || typeStr === 'image/x-icon'){
        res.setHeader('cache-control', 'public,max-age=31536000,immutable');
      }
      if(typeStr === 'application/javascript'){
        res.setHeader('cache-control', 'public,max-age=2592000');
      }
    }
}))

//ROUTES
var blueprint = require('./routes/blueprint')
var rmData = require('./routes/rm-data')
//var blueprintImg = require('./routes/blueprint-image')
var index = require('./routes/index')


app.use('/rm-data', rmData)
app.use('/blueprint', blueprint)
//app.use('/blueprint-image', blueprintImg)
app.use('/$', index)

//CATCH 404
app.use(function (req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})
//CATCH 500
if (app.get('env') === 'development') {
    app.use(logger('dev'))
    app.use(function (err, req, res, next) {
        res.status(err.status || 500)
        res.render('error', {
        message: err.message,
        error: err
        })
    })
}else{
    app.use(function (err, req, res, next) {
        res.status(err.status || 500)
        res.render('error', {
          message: err.message,
          error: {}
        })
    })
}

module.exports = app
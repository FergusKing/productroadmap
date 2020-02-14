const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mime = require('mime-types')
const compression = require('compression')
const helmet = require('helmet')
const proxy = require('express-http-proxy');

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

// Proxy images from Prismics cdn so that they have our domain - this improves search indexation
app.use('/rm-data/:sheetId/:teamId', proxy('https://spreadsheets.google.com', {
  proxyReqPathResolver: function(req) {
    return new Promise(function (resolve, reject) {
      console.log('/feeds/list/' + req.params.sheetId + '/' + req.params.teamId + '/public/basic')
      resolve('/feeds/list/' + req.params.sheetId + '/' + req.params.teamId + '/public/basic?alt=json');
    });
  }
}));

//ROUTES
var blueprint = require('./routes/blueprint')
//var blueprintImg = require('./routes/blueprint-image')
var index = require('./routes/index')


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
const express = require('express')
var router = express.Router()

router.use(function(req, res, next){
    next()
})

router.get('', function(req, res, next){
    res.render('igloo',{
        urlLink: ''
    })
})



module.exports = router
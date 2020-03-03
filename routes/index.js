const express = require('express')
var router = express.Router()

router.use(function(req, res, next){
    next()
})

router.get('*', function(req, res, next){
    res.status(404).send('I havent built this yet')
})

module.exports = router
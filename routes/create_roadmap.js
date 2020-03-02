const express = require('express')
var router = express.Router()
var dataSec = require('../services/data-security')

router.use(function(req, res, next){
    if(req.body.siteId){
        req.sheetId = dataSec.encrypt(req.body.siteId)
    }
    next()
})

router.get('', function(req, res, next){
    res.render('create_roadmap',{
        urlLink: ''
    })
})

router.post('', function(req, res, next){
    res.render('create_roadmap',{
        urlLink: req.sheetId
    })
})


module.exports = router
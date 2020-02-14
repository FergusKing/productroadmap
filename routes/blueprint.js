const express = require('express')
var router = express.Router()

router.use(function(req, res, next){
    next()
})

router.get('/:siteId$', function(req, res, next){
    res.render('blueprint',{
        sheetId: req.params.siteId
    })
})

router.get('*', function(req, res, next){
    res.status(404)
    res.send('Page not found')
    res.end()
})

module.exports = router
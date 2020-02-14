const express = require('express')
var router = express.Router()
var sheets = require('../services/sheets-data')

router.use('/:sheetId/:pageId$',function(req, res, next){
  sheets.getSheetsData(req.params.sheetId, req.params.pageId, function(data){
    req.sheetsData = data
    next()
  })
})

router.get('*', function(req, res, next){
  res.status(200)
  res.type('json')
  res.send(req.sheetsData)
  res.end()  
})

module.exports = router
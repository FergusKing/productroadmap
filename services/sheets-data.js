const apiReq = require('request')
var dataSec = require('./data-security')

function getSheetsData(sheetId, pageId, callback){
  sheetId = dataSec.decrypt(sheetId)
  apiReq.get('https://spreadsheets.google.com/feeds/list/' + sheetId + '/' + pageId + '/public/basic?alt=json', (error, response, body) => {
      if(error) {
          return console.log(error);
      }
      callback(body)
  });
}

module.exports = {
  getSheetsData
}
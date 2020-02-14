const apiReq = require('request')

function getSheetsData(sheetId, pageId, callback){
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
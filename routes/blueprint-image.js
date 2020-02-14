const express = require('express')
var router = express.Router()
const puppeteer = require('puppeteer')
var fs = require('fs');

router.use(function(req, res, next){  
    (async () => {
        const browser = await puppeteer.launch({
            defaultViewport: {
                width: 1500,
                height: 800
            },
            waitUntil: 'networkidle2',
            args: ['--no-sandbox']
        })
        const page = await browser.newPage()
        page.goto('/blueprint')
        await page.waitFor(3000);
        await page.screenshot({
            path: './public/roadmap/roadmap.png',
            fullPage: true
        })
        await browser.close()
        next()
    })()
})

router.get('*', function(req, res, next){
    res.redirect(301,'/roadmap/roadmap.png')
})

module.exports = router
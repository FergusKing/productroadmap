window.h = {
  removeClass: function(el, cName){
    var classStr = el.className 
    var regExSpace = new RegExp(' \\b' + cName + '\\b','g')
    if(regExSpace.test(classStr)){
      el.className = el.className.replace(regExSpace, "")
    }else{
      var regEx = new RegExp('\\b' + cName + '\\b','g')
      el.className = el.className.replace(regEx, "")
    }
  },
  addClass: function(el, cName){
    el.className += ' ' + cName
  }
}
window.rm = {
  sheet: rmConfig.sheetId,
  teamInt: undefined,
  teamsData: new Array(),
  contObj: undefined,
  headerObj: undefined,
  headerTop: undefined,
  headerStuck: false,
  init: function(){
    if (rmConfig.contObj !== undefined){
      rm.contObj = rmConfig.contObj
      rm.hideForLoad()
      rm.setStyles()
      rm.buildBaseElements()
      rm.buildFrame()
      rm.buildChangeLog()
      rm.getConfig()
      rm.setWeekDates()
    }
  },
  hideForLoad: function(){
    if(rmConfig.contObj){
      rmConfig.contObj.style.display = 'none';
    }
  },
  setStyles: function(){
    var css = document.createElement('link')
    css.href = '/roadmap/roadmap.css'
    css.rel = 'stylesheet'
    css.type = 'text/css'
    css.addEventListener('load',function(){
      rmConfig.contObj.style.display = 'block'
      rm.setNavScroll()
    })
    document.head.appendChild(css)
  },
  buildBaseElements: function(){
    document.body.setAttribute('data-fontLoad','false')
    var header = document.createElement('header')
    header.innerHTML = '<div><h1>Digital Roadmap</h1></div><div class="gradient-line"></div>'
    rm.contObj.appendChild(header)
  },
  buildFrame: function(){
    var mainObj = document.createElement('main')
    mainObj.id = 'main'
    mainObj.innerHTML = 
        `<section class="rm__cont rm__headings">
            <div class="rm__col rm__team"></div>
            <div class="rm__col rm__done">
                <h2>Done</h2>
            </div>
            <div class="rm__col rm__now">
                <div>
                    <h2>Now</h2>
                </div>
                <div class="rm__now--container">
                    <div class="rm__now--lines" id="line4"></div>
                    <div class="rm__now--lines" id="line8"></div>
                    <div class="rm__item" id="startWeek" style="grid-column-start: 1; grid-column-end: 3;"></div>
                    <div class="rm__item" id="week4" style="grid-column-start: 5; grid-column-end: 7;"></div>
                    <div class="rm__item" id="week8" style="grid-column-start: 9; grid-column-end: 11;"></div>
                </div>
            </div>
            <div class="rm__col rm__next">
                <h2>Next</h2>
            </div>
            <div class="rm__col rm__later">
                <h2>Later</h2>
            </div>
        </section>
        <section class="rm__cont rm__headings--spacer">
        </section>`
    rm.contObj.appendChild(mainObj)
  },
  buildChangeLog: function(){
    var header = document.createElement('header')
    header.className = 'header--change-log'
    header.innerHTML = '<div><h1>Change log</h1></div><div class="gradient-line"></div>'
    rm.contObj.appendChild(header)
    var table = document.createElement('table')
    table.id = 'change-log'
    table.innerHTML = '<tr><th colspan="2">Product team</th><th>Summary of changes from previous week</th></tr>'
    rm.contObj.appendChild(table)
  },
  getConfig: function(){
    var reqConfig = new XMLHttpRequest();
    reqConfig.onreadystatechange = function () {
        if (this.readyState === 4 && this.status == 200) {
            var data = JSON.parse(this.responseText)
            var teamsRA = rm.convertString(data.feed.entry[0].content.$t)
            rm.teamInt = Number(teamsRA.col1)

            var teamConfigRA = data.feed.entry

            for (var x = 2; x <= rm.teamInt + 1; x++) {
                var teamConfig = rm.convertString(teamConfigRA[x].content.$t)
                rm.teamsData[x] = {
                    data: undefined,
                    color: teamConfig.col1,
                    logo: teamConfig.col2
                };
                rm.getTeams(x)
            }

            rm.createChangeLog()
        }
    }
    reqConfig.open('GET', '/rm-data/' + rm.sheet + '/1', true)
    reqConfig.send()
  },
  getTeams: function(team) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4 && this.status == 200) {
            var data = JSON.parse(this.responseText)

            rm.teamsData[team].data = data

            //Check that we are all done
            var allDone = true;
            for (var x = 2; x <= rm.teamInt + 1; x++) {
                if(rm.teamsData[x].data === undefined){
                    allDone = false;
                }
            }
            if (allDone === true){
                //Build if we are all done
                rm.startRoadmapBuild()
            }
        }
    }
    req.open('GET', '/rm-data/' + rm.sheet + '/' + team , true)
    req.send()
  },
  startRoadmapBuild: function(){
    for (var x = 2; x <= rm.teamInt + 1; x++) {
        rm.createRoadmap(rm.teamsData[x].data, rm.teamsData[x].color, rm.teamsData[x].logo, x)
    }
    rm.buildHiddenHeadings();
  },
  createRoadmap: function(data, color, logo, index) {
    var rmItem = {
        done: [],
        now: [],
        next: [],
        later: []
    }
    data.feed.entry.forEach(entry => {
        var entryRA = rm.convertString(entry.content.$t)
        entryRA['title'] = entry.title.$t
        switch (entryRA.status) {
            case "Done":
                rmItem.done.push(entryRA)
                break;
            case "Now":
                rmItem.now.push(entryRA)
                break;
            case "Next":
                rmItem.next.push(entryRA)
                break;
            case "Later":
                rmItem.later.push(entryRA)
                break;
        }
    });
    rm.createSection(data.feed.title.$t, rmItem, color, logo, index)
  },
  createSection: function(titleStr, data, color, logo, index) {
    if (index === 5 || index === 8){
        var header = document.createElement('header')
        header.className = 'rm__headings--hidden'
        var heading = document.createElement('section')
        heading.className = 'rm__cont rm__headings rm__headings--hidden'
        document.querySelector('main').appendChild(header)
        document.querySelector('main').appendChild(heading)
    }
    var sec = document.createElement('section')
    sec.className = 'rm__cont rm__cont--' + color
    sec.appendChild(rm.createTeam(titleStr, logo))
    data.done.reverse();
    data.done.splice(5, data.done.length)
    sec.appendChild(rm.createSimple('done', data.done))
    sec.appendChild(rm.createNow(data.now))
    sec.appendChild(rm.createSimple('next', data.next))
    sec.appendChild(rm.createSimple('later', data.later))
    document.querySelector('main').appendChild(sec)
  },
  createTeam: function(titleStr, logo) {
    var div = document.createElement('div')
    div.className = 'rm__col rm__team'
    div.innerHTML = logo
    div.innerHTML += '<h2>' + titleStr + '</h2>'
    return div
  },
  createSimple: function(type, data) {
    var div = document.createElement('div')
    div.className = 'rm__col rm__' + type
    data.forEach(item => {
        var rm__item = document.createElement('div')
        rm__item.className = 'rm__item'
        rm__item.innerText = item.title
        div.appendChild(rm__item)
    });
    return div
  },
  createNow: function(data) {
    var div = document.createElement('div')
    div.className = 'rm__col rm__now'
    for(var x = 1 ; x < 12 ; x++){
        div.appendChild(rm.addlines(x))
    }
    var div_cont = document.createElement('div')
    div_cont.className = 'rm__now--container'
    data.forEach(item => {
        var rm__item = document.createElement('div')
        rm__item.innerText = item.title
        var extraClass = ''
        if (item.weekend >= 12) {
            if(item.weekend >= 13){
                extraClass = ' rm__now--later'
            }else{
                item.weekend = 13
            }
        } else {
            item.weekend = Number(item.weekend) + 1
        }

        //check if it is a single box
        if(item.weekend <= 2){
            extraClass = ' rm__item--thin'
            rm__item.innerText = ''
        }
        rm__item.className = 'rm__item' + extraClass
        rm__item.setAttribute('style', 'grid-column-start: ' + item.weekstart + '; grid-column-end: ' + item.weekend + ';')
        div_cont.appendChild(rm__item)
        if(item.weekend <= 2){
            var rm__label = document.createElement('div')
            rm__label.innerText = item.title
            rm__label.className = 'rm__item rm__item--label'
            rm__label.setAttribute('style', 'grid-column-start: ' + item.weekend + '; grid-column-end: ' + (item.weekend + 4) + ';')
            div_cont.appendChild(rm__label)
        }
    });
    div.appendChild(div_cont)
    return div
  },
  addlines: function(lineInt){
    var div = document.createElement('div')
    div.className = 'rm__now--lines'
    div.id = 'line' + lineInt
    return div
  },
  buildHiddenHeadings: function(){
    var headHidden = document.querySelectorAll('header.rm__headings--hidden')
    var hh = document.querySelectorAll('section.rm__headings--hidden')
    var htmlStr = document.querySelector('.rm__cont.rm__headings').innerHTML
    var headerHtmlStr = document.querySelector('header').innerHTML
    hh.forEach(hHeading => {
        hHeading.innerHTML = htmlStr
    });
    headHidden.forEach(hHeader => {
        hHeader.innerHTML = headerHtmlStr
    });
  },
  setWeekDates: function(){
    document.querySelector('#startWeek').innerText = rm.formatDate(rm.getWeekStart(0))
    document.querySelector('#week4').innerText = rm.formatDate(rm.getWeekStart(28))
    document.querySelector('#week8').innerText = rm.formatDate(rm.getWeekStart(56))
  },
  getWeekStart: function(plusInt){
    d = new Date();
    var day = d.getDay()
    diff = d.getDate() - (day - plusInt - 1)
    var mon = new Date(d.setDate(diff));
    return mon
  },
  formatDate: function(date){
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return date.getDate() + ' ' + months[date.getMonth()]
  },
  createChangeLog: function(){
    var reqChangeLog = new XMLHttpRequest();
    reqChangeLog.onreadystatechange = function () {
        if (this.readyState === 4 && this.status == 200) {
            var data = JSON.parse(this.responseText)
            var htmlStr = '';
            data.feed.entry.forEach ((entry, index) => {
                var entryContRA = rm.convertString(entry.content.$t)
                console.log(entryContRA.blurb)
                htmlStr += '<tr><td class="tbl__logo">' + rm.teamsData[index+2].logo + '</td><td class="tbl__heading">' + entry.title.$t + '</td><td class="tbl__content">' + rm.changeLogFormat(entryContRA.blurb) + '</td></tr>'
            })
            document.querySelector('#change-log').innerHTML += htmlStr
            console.log('renderable')
            window.renderable = true;
        }
    }
    reqChangeLog.open('GET', '/rm-data/' + rm.sheet + '/' + (rm.teamInt + 2), true)
    reqChangeLog.send()
  },
  changeLogFormat: function(txtStr){
    txtStr = txtStr.replace('\n', '<br>')
    txtBoldRA = txtStr.split('*')
    var boldStr = ''
    txtBoldRA.forEach((txtStr, index) => {
        if (index === 0){
            boldStr = txtStr
        }else if (index === (txtBoldRA.length)){
            boldStr += txtStr
        }else if (index % 2 === 0) {
            boldStr += '</strong>' + txtStr
        } else {
            boldStr += '<strong>' + txtStr
        }
    });
    txtStr = boldStr
    return txtStr
  },
  setNavScroll: function(){
    rm.headerObj = document.querySelector('.rm__headings:not(.rm__headings--hidden)')
    rm.headerTop = rm.headerObj.offsetTop
    window.addEventListener('scroll', rm.stickHeader)
  },
  stickHeader: function(){
    if(window.scrollY >= rm.headerTop && rm.headerStuck === false){
        document.querySelector('.rm__headings--spacer').style.height = rm.headerObj.offsetHeight;
        rm.headerObj.className += ' rm__headings--pin'
        rm.headerStuck = true;
    }else if (window.scrollY < rm.headerTop && rm.headerStuck === true){
        h.removeClass(rm.headerObj,'rm__headings--pin')
        rm.headerStuck = false;
    }
  },
  convertString: function(data) {
    var outRA = new Array()
    var keyRA = data.split(/,\s/g)
    keyRA.forEach(key => {
        var valRA = key.split(/:\s/g);
        valRA.forEach(val => {
            outRA[valRA[0]] = valRA[1];
        });
    });
    return outRA;
  }
}
rm.init()


/*window.uiPre = {
    font: {
        version: "1.3",
        check: function () {
            try {
                var localFont = window.localStorage.getItem("fonts");
                if (localFont){
                    var fontData = JSON.parse(localFont);
                    if(fontData.version == uiPre.font.version) {
                        uiPre.font.load(fontData.css);
                        document.body.setAttribute("data-fontload", "true");
                    }
                }
            } catch (a) {
                uiPre.font.fallback()
            }
        },
        load: function (a) {
            var b = document.createElement("style");
            b.innerHTML = a;
            document.head.appendChild(b);
        },
        fallback: function () {
            document.body.setAttribute("data-fontload", "fallback");
            var a = document.createElement("style");
            a.src = "/fonts/fonts.css"; //TODO fix this
            document.head.appendChild(a)
        }
    }
};
uiPre.font.check();
window.ui = {
    init: function () {
        ui.font.init();
    },
    font: {
        url: '/fonts/fonts.json',
        init: function () {
            var fontLoaded = document.body.getAttribute('data-fontLoad');
            if (fontLoaded == 'false') {
                ui.font.save();
            }
        },
        save: function () {
            var req = new XMLHttpRequest(), res;
            req.open('GET', ui.font.url, true);
            req.send();
            req.onload = function () {
                if (this.status == 200) {
                    try {
                        window.localStorage.setItem('fonts', this.response);
                        res = JSON.parse(this.response);
                        var b = document.createElement("style");
                        b.innerHTML = res.css;
                        document.head.appendChild(b);
                    } catch (err) {
                        uiPre.font.fallback();
                    }
                } else {
                    uiPre.font.fallback();
                }
            }
        }
    }
}
window.onload = function(){
  ui.init();
}*/
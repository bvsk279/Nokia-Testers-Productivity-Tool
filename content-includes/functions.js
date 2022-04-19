//Get user API
//https://rep-portal.wroclaw.nsn-rdnet.net/api/users/?username=belvenka&varnish=nocache
$("body").prepend("<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css'></link>");
const UserSettings = null

window.reservationWarningCall = false
$("body").prepend("<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css'></link>");
$("body").prepend('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap" rel="stylesheet"></link>')

function playSound(type, warningAudioId) {
    if(warningAudioId != undefined && warningAudioId != null){
        const audioURLs = {
            "1Hour": "https://nokia-testers-tool.s3.ap-south-1.amazonaws.com/1Hour-Warning.mp3",
            "30Minute" : "https://nokia-testers-tool.s3.ap-south-1.amazonaws.com/30Minute-Warning.mp3",
            "10Minute": "https://nokia-testers-tool.s3.ap-south-1.amazonaws.com/10Minute-Warning.mp3"
        }
        var audio = document.getElementById(warningAudioId)
        audio.src = audioURLs[type];
        //console.log("Audio Detected!");
        audio.muted = false;
        // audio.autoplay = true;
        audio.play();
    }
}

function getDuration(endDate){
    var dateFuture = Date.parse(endDate);
    var dateNow = new Date();
    var timeleft = dateFuture - dateNow.getTime();
    if(timeleft<=0) return "completed";
    var days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
    var hrs = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var mins = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
    var secs = Math.floor((timeleft % (1000 * 60)) / 1000);
    //console.log(days+":"+hrs+":"+mins+":"+secs)
    return days+":"+hrs+":"+mins+":"+secs;
}

// function getLocalStorage(){
//     chrome.storage.sync.get(["nokiaUserSettings"], function(data){
//         var userSettings = JSON.parse(data.nokiaUserSettings)
//         userSettings.uteReservations.isIdFiledExtended = true
//         console.log(userSettings);
//     })
// }


function getTimeLeft(endDate, warningAudioId, userSettings){
    var timeLeft = getDuration(endDate, warningAudioId); //30 Nov 2021, 00:23:10 am
    //var days = parseInt(timeLeft.split(":")[0]);
    var hrs = parseInt(timeLeft.split(":")[1]);
    var mins = parseInt(timeLeft.split(":")[2]);
    var secs = parseInt(timeLeft.split(":")[3]);

    var styles = "font-size: 0.95em; padding-left:1px";
    var comment = "<span style='font-size: 0.6em'>left</span></span>";

    function setWarningActive(){
        window.reservationWarningCall = true
        setTimeout(function(){window.reservationWarningCall = false}, 10000)
    }
    //Warning Alarm
    if(warningAudioId){
        if(hrs == 1){
            if(mins == 1 && !window.reservationWarningCall && userSettings.uteCloud.warnings.oneHourWarning == true)
                if(secs <= 1){
                    playSound("1Hour", warningAudioId);
                    setWarningActive()
                }
        }
        if(hrs == 0){
            if(mins == 31 && !window.reservationWarningCall && userSettings.uteCloud.warnings.thirtyMinuteWarning == true) //mins == 30 && && 
                if(secs <= 1){
                    playSound("30Minute", warningAudioId);
                    setWarningActive()
                }
            if(mins == 11 && !window.reservationWarningCall && userSettings.uteCloud.warnings.tenMinuteWarning == true)
                if(secs <= 1){
                    playSound("10Minute", warningAudioId);
                    setWarningActive()
                }
        }
    }

    if(hrs==0 && mins == 0)
        return secs+"<span style='"+styles+"'>sec</span> "+comment;
    if(hrs == 0){
        return mins+"<span style='"+styles+"'>min</span> "+comment
    }
    if(isNaN(hrs) || isNaN(mins) || isNaN(secs)) 
        return "<span style='"+styles+"'>Finished</span>";
    return hrs + "<span style='"+styles+"'>hr</span> " + mins + "<span style='"+styles+"'>min</span> "+comment;
    //+ secs + "<span style='"+styles+"'>sec</span> "
}


async function getWebContent(URL) {
    console.log("From Function: "+URL)
        const response = await fetch(URL, {}).then(res => res).then(data => data) // type: Promise<Response>
        if (!response.ok) {
            //throw Error(response.statusText)
            //console.log("failed to load!");
        }
        return response.text()
}


async function getJsonData(API_URL) {
    const response = await fetch(API_URL, {}).then(res => res).then(data => data) // type: Promise<Response>
    if (!response.ok) {
      //throw Error(response.statusText)
      //console.log("failed to load!");
    }
    return response.json()
}


const getHeaderCell= (width) => {
  return `<div col="col" ui-grid-header-cell="" class="ui-grid-header-cell ext-elm-header-cell" style="max-width: ${width}px; min-width: ${width}px;">
            <div class="ui-grid-column-resizer ng-scope ng-isolate-scope left" col="col" position="left" ui-grid-column-resizer="" unselectable="on"></div>
            <div role="columnheader">
                <div tabindex="0" class="ui-grid-cell-contents ui-grid-header-cell-primary-focus">
                    <span class="ui-grid-header-cell-label">Reason for Failure</span>
                    <span class="ui-grid-invisible"></span>
                </div>
                <div ui-grid-filter="">
                    <div class="ui-grid-filter-container">
                        <div class="rep-inline">
                            <rep-inline-filter class="ng-isolate-scope">
                                <div><input type="button" ng-disabled="disabled" aria-invalid="false" class="form-control"></div>
                            </rep-inline-filter>
                        </div>
                    </div>
                </div>
            </div>
            <div ui-grid-column-resizer="" ng-if="grid.options.enableColumnResizing" class="ui-grid-column-resizer ng-scope ng-isolate-scope right" col="col" position="right" render-index="renderIndex" unselectable="on"></div>
          </div>`;
}

const getColumnCell = (width, content) => {
    return `<div class="ui-grid-cell ng-scope ext-elm-col-cell" role="gridcell" ui-grid-cell="" style="max-width: ${width}px; min-width: ${width}px;">
                <div class="ui-grid-cell-contents ng-scope">
                  <zoom-cell placement="center">
                      <div class="zoom-container">
                        <ng-transclude>
                                <div class="ui-grid-cell-contents-comments break-all ng-scope">
                                    <div><span class="ng-binding ext-cell-contents">${content}</span></div>
                                </div>
                            </ng-transclude>
                        <div class="zoom-extend" ng-click="togglePopup()" role="button" tabindex="0">
                            <i class="fa fa-expand" aria-hidden="true"></i>
                        </div>
                      </div>
                  </zoom-cell>
                </div>
              </div>`;
}



const setUrlSearchParam = (URL, paramName, paramValue) =>{
    var queryString =  URL ? URL.split('?')[1] : window.location.search.slice(1);
    var params = new URLSearchParams(queryString)
    params.set(paramName, paramValue)
    return URL.split('?')[0]+"?"+params; 
}

const extExecCopy = (copyText, message) => {
    navigator.clipboard.writeText(copyText).then(() => {if(message) alert(message)})
}
const getSearchParam = (searchParams, param) =>{
    var params = new URLSearchParams(searchParams)
    return params.get(param)
}

const toogleTeamProgress = (status) => {
    chrome.storage.sync.get(["nokiaUserSettings"], function(data){
        const settings = JSON.parse(data.nokiaUserSettings);
        settings.repPortal.isTeamProgressOpen = (status) ? true : false
        chrome.storage.sync.set({ "nokiaUserSettings": JSON.stringify(settings) }, function(){});
    });
}

async function get_TC_Stats(reqApiUrl, userSettings){
    var apiURL = null
    var apiParams = new URLSearchParams(reqApiUrl.split('?')[1])
    apiParams.set('limit', '1000')
    apiParams.set('fields', 'res_tester,ca,wall_status__status')
    apiParams.set('extension_request', 'true') // Adding this will avoid infinite loop
    apiURL = reqApiUrl.split('?')[0]+"?"+apiParams;
    // console.log("API Params: "+apiURL);

    var jsonData = await getJsonData(apiURL)
    var nextURL = jsonData.next;
    var loopCount = 0;
    while(nextURL != null){
        // console.log("While Looping...");
        var newJsonData = await getJsonData(nextURL+"&extension_request=true")
        jsonData.results = jsonData.results.concat(newJsonData.results)
        nextURL = newJsonData.next
        loopCount++;
        if(loopCount >= 5){break} //Max Web Requests: 5
    }

    var jsonDataResults = jsonData.results;

    var names = []
    for(var i in jsonDataResults){
        var name = jsonDataResults[i].res_tester;
        if(name) names.push(name)
    }

    var map = names.reduce(function(p, c) {p[c] = (p[c] || 0) + 1; return p }, {});
    var sortedNames = Object.keys(map).sort(function(a, b) {return map[b] - map[a] });
    var count = 0;
    var statsHTML = "<tbody>"
    for(var i in sortedNames){
        count += 1;
        if(userSettings.userData && userSettings.userData.userName != undefined && userSettings.userData.userName != null && userSettings.userData.userName != '' && sortedNames[i].includes(userSettings.userData.userName)){
            statsHTML += `<tr style='border: 3px solid #0fc10f'>
                            <th>${count}</th>
                            <td class='tester-name'>${sortedNames[i]}</td>
                            <td>${map[sortedNames[i]]}</td>
                        </tr>`;
        }else{
            statsHTML += `<tr>
                            <th>${count}</th>
                            <td class='tester-name'>${sortedNames[i]}</td>
                            <td>${map[sortedNames[i]]}</td>
                        </tr>`;
        }
    }
    statsHTML += "<tr><th></th><td><b>Grand total</b></td><td><b>"+names.length+"</b></td></tr></tbody>";
    return statsHTML;
}

const sendMessage = (messageText, insertionElm, addStyles) =>{
    if(!addStyles) addStyles="";
    messagebox = insertionElm+" .ext-message-box"
    if($(messagebox).length > 0){
        $(messagebox).html(messageText)
        $(messagebox).hide();
        clearTimeout(window.x); clearTimeout(window.xin);
    }else{
        $(insertionElm).append(`<div class='ext-message-box' style="${addStyles}+;display:none">${messageText}</div>`)
    }

    setTimeout(function(){
        var currentMargin = "30px"
        $(messagebox).css({'transition':'unset', 'margin-right':'calc('+currentMargin+' - 8px)'})
        $(messagebox).show();
        $(messagebox).css({'transition':'0.1s ease-in','margin-right':currentMargin})
        window.x = setTimeout(function(){
            $(messagebox).css({'margin-right':'calc('+currentMargin+' - 8px)'})
            window.xin = setTimeout(function(){
                $(messagebox).hide();
            },100)
        },3000)
    },200)
}
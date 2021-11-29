console.log("Includes background script is running...");


chrome.runtime.onInstalled.addListener(function() {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
      // changeInfo object: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated#changeInfo
      // status is more reliable (in my case)
      console.log(JSON.stringify(changeInfo)) //" to check what's available and works in your case
      if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, {
          message: 'TabUpdated'
        });
      }
    })
    
    //Setting the local data
    var newNokiaUserSettings = {
      "userData":{
          "userName": "",
          "competenceArea": ""
      },
      "uteCloud": {
          "userRes":{
              "isIdExtended": false
          },
          "execPage":{
              "isIdExtended": false
          },
          "warnings": {
              "tenMinuteWarning" : true,
              "thirtyMinuteWarning": true,
              "oneHourWarning": true
          }
      }
  }
  chrome.storage.sync.set({ "nokiaUserSettings": JSON.stringify(newNokiaUserSettings)}, function(){});
});



// chrome.tabs.onUpdated.addListener(function(){
//     if(window.location.host == "www.youtube.com" || window.location.host == "youtu.be"){
//         var currentURLID = ytVideoIDExtractor(window.location.href);
//     }
//     var title = document.title;
//     $("ytd-compact-autoplay-renderer").html("<div id='zya-frame' class='style-scope'><div class='zya-header'><h2 class='vertical-center'>Zopamo&nbsp;Youtube&nbsp;Audios</h2></div><div class='zya-content-wrapper'><div class='zya-content'><p>Available Audios for Current Video (<span id='audio-items-count'>4</span>)</p><div class='zya-audio-items'><div class='zya-audio-item'> <i class='fas fa-play'></i></div><div class='zya-audio-item zya-audio-active'></div><div class='zya-audio-item'></div><p class='zya-end-results'>No more available</p></div></div></div></div>");
//     $(".zya-header h2").append("&emsp;"+currentURLID+"");
// });

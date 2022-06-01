// console.log("Background script is running...");

chrome.runtime.onInstalled.addListener(function() {
    //Setting up local storage
    const newNokiaUserSettings = {
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
          },
          "autoExtendTestlineRes": true
      },
      "repPortal":{
        "isTeamProgressOpen": false,
        "cit_chart_page":{
          "display_categories": ['no-run', 'not-analyzed', 'env-issue', 'failed']
        },
        "crt_chart_page":{
          "display_categories": ['crt_no-run', 'crt_failed', 'crt_cloud']
        }
      }
  }
  chrome.storage.sync.get(["nokiaUserSettings"], function(data){
    if(!data.hasOwnProperty('nokiaUserSettings')){
      //If nokiaUserSettings are not there in client storage
      //Remember, If you want to update the user settings json, Call this below code after this if else
      chrome.storage.sync.set({ "nokiaUserSettings": JSON.stringify(newNokiaUserSettings)}, function(){});
    }else{
      let tempSaveSettings = JSON.parse(data.nokiaUserSettings);
      chrome.storage.sync.set({ "nokiaUserSettings": JSON.stringify(
        { ...tempSaveSettings,
          "uteCloud": {
            ...tempSaveSettings.uteCloud,
            "autoExtendTestlineRes": true
          }
        }
      )}, function(){});
    }
  });
});


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // changeInfo object: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated#changeInfo
  // status is more reliable (in my case)
  // console.log(JSON.stringify(changeInfo)) //" to check what's available and works in your case
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, {message: 'TabUpdated'}, function(response){
      if(response) console.log("Success")
    });
  }
})

//Team Progress Feature
chrome.webRequest.onBeforeRequest.addListener(function(details) { 
  if(details.url.includes('/api/') && details.url.includes('/report') && details.url.includes('fields=') && !details.url.includes('extension_request=true')){
    // console.log(details.url);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){

      var port = chrome.tabs.connect(tabs[0].id, {name:"apiWebRequest"});
      port.postMessage({
        url: details.url
      });
      // console.log("Post message Success");
    });
  }
},
{urls: ["*://rep-portal.wroclaw.nsn-rdnet.net/*"]},
["requestBody"]
);


// https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/
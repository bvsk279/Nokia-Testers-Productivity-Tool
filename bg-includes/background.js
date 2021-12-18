console.log("Includes background script is running...");


chrome.runtime.onInstalled.addListener(function() {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
      // changeInfo object: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated#changeInfo
      // status is more reliable (in my case)
      // console.log(JSON.stringify(changeInfo)) //" to check what's available and works in your case
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



//Team Progress Feature
chrome.webRequest.onBeforeRequest.addListener(function(details) { 
    if(details.url.includes('/api/') && details.url.includes('/report') && details.url.includes('fields=') && !details.url.includes('extension-request=true')){
      console.log(details);
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
          chrome.tabs.sendMessage(tabs[0].id, {
                message: 'apiWebRequest',
                url: details.url
            }, function(response) { console.log(response.status) });  
      });
    }
  },
  {urls: ["*://rep-portal.wroclaw.nsn-rdnet.net/*"]},
  ["requestBody"]
);
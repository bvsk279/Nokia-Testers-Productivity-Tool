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
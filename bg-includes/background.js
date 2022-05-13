console.log("Background script is running...");

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
  chrome.storage.sync.set({ "nokiaUserSettings": JSON.stringify(newNokiaUserSettings)}, function(){});
});


//Team Progress Feature
chrome.webRequest.onBeforeRequest.addListener(function(details) { 
  if(details.url.includes('/api/') && details.url.includes('/report') && details.url.includes('fields=') && !details.url.includes('extension_request=true')){
    console.log(details.url);
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      // console.log(tabs)
      
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


// window.Tabs = []
// chrome.webRequest.onBeforeRequest.addListener(function(details) { 
//   if(details.url.includes('/api/') && details.url.includes('/report') && details.url.includes('fields=') && !details.url.includes('extension_request=true')){
//     console.log(details.url);
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
//       window.Tabs.push({id: tabs[0].id, lastRequestURL: details.url})
//     });
//   }
// },
// {urls: ["*://rep-portal.wroclaw.nsn-rdnet.net/*"]},
// ["requestBody"]
// );

// chrome.runtime.onConnect.addListener(function(port) {
//   console.log("Port Detected");
//   if(port.name === 'apiWebRequest') {
//     port.onMessage.addListener(function(msg) {
//       if (msg.request == "Get Last API Request")
//       console.log("Tabs: "+window.Tabs)
//       for(var i in window.Tabs){
//         console.log(window.Tabs[i])
//         if(window.Tabs[i].id == msg.tabId){
//           port.postMessage({url: window.Tabs[i].lastRequestURL});
//         }
//       }
//     });
//   }
// })




// https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/
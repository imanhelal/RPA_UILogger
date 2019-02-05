// triggers every time a new page is activated.
//chrome.tabs.onActivated.addListener(function () { printUrl("activated") });
chrome.windows.onFocusChanged.addListener(function () { printUrl("focus changed") });

//connect runtime
var portFromCS;
chrome.runtime.onConnect.addListener(connected);

function connected(p) {
    portFromCS = p;
    //portFromCS.postMessage({greeting: "hi there content script!"});
    portFromCS.onMessage.addListener(function (m) {
        console.log(m);
        postRest(m);
    });
}

function printUrl(message) {
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var activetab = tabs[0].url;
        var req = { timeStamp: Date.now(), eventType: message, url: activetab };
        //alert(req);
        console.log(req);
        postRest(req);
    });
}

function postRest(req) {
    var storage = (localStorage.getItem('checkboxValue') || {}) == 'true';
    if (storage === true) {
        console.log("Recording Enabled")
        $.ajax({
            type: "POST",
            url: "http://127.0.0.1:8080",
            crossDomain: true,
            contentType: 'application/json',
            data: JSON.stringify(req),
            success: function (responseData, status, xhr) {
                console.log("Request Successful!" + responseData);
            },
            error: function (request, status, error) {
                console.log("Request Failed! " + JSON.stringify(request) + 'Status ' + status + "Error msg: " + error);
            }
        });
    } else {
        console.log("Recording Disabled");
    }
}

chrome.webNavigation.onCommitted.addListener(navigation);

function navigation(evt){
    var req = { timeStamp: Date.now(), eventType: evt.transitionType, eventQual:JSON.stringify(evt.transitionQualifiers),url: evt.url };
    if (evt.transitionType != "auto_subframe") {
        console.log(req);
        postRest(req);
    }
}

//chrome.webNavigation.onBeforeNavigate.addListener(logOnBefore);
// very spammy!

function logOnBefore(details){
    var req = { timeStamp: Date.now(), eventType: "navigateTo", url: details.url };
    //alert(req);
    console.log(req);
    postRest(req);
}
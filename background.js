function createAlarm(delayInMinutes, periodInMinutes){
	chrome.alarms.create("mainAlarm", {"periodInMinutes": periodInMinutes?periodInMinutes:1});
}

chrome.alarms.onAlarm.addListener(function(alarm) {
	if (alarm.name=="mainAlarm") refresh();
});

chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({"url": "https://www.reddit.com/message/inbox/"}, function(tab){
		setTimeout(function(){
			refresh();
		}, 10000);
	});
});

function getTime(){
	return new Date().getTime()/1000;
}

lastTimeChecked = 0;

function refresh(tabId){
	if (getTime()-lastTimeChecked<1) return;
	chrome.storage.sync.get(undefined, function(items){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", items.jsonFeed);
		xhr.responseType = 'json';
		xhr.onload = function() {
			var response = xhr.response;
			if (!response) {
				console.error("No response");
				return;
			}
			if (getTime()-lastTimeChecked<10) return;
			console.log("Refreshing after "+(getTime()-lastTimeChecked)+" seconds");
			lastTimeChecked = getTime();
			unread = response.data.children;
			if (unread.length>0){
				chrome.browserAction.setIcon({"path": "inbox.png"});
				chrome.browserAction.setBadgeText({"text": unread.length.toString()});
				if (items.notifications) {
					for (i=0; i<unread.length; i++) {
						var msg = unread[i];
						var options = {type:"basic", iconUrl:"chrome-extension://"+chrome.runtime.id+"/inbox.png", title:getTitle(msg), message:msg.data.body, contextMessage:getContextMessage(msg.data), isClickable:true};
						chrome.notifications.create(i.toString(), options, function(notificationId){
							setTimeout(function(){
								chrome.notifications.clear(notificationId, function(wasCleared){});
							}, 9000);
							new Audio("notification.mp3").play();
						});
					}
				}
			}else{
				chrome.browserAction.setIcon({"path": "noInbox.png"});
				chrome.browserAction.setBadgeText({"text": ""});
			}
		}
		xhr.onerror = function() {
			console.error("Network Error");
		};
		xhr.send();
	});	
}

chrome.notifications.onClicked.addListener(function(notificationId){
	var msg = unread[notificationId];
	chrome.tabs.create({"url": "https://www.reddit.com"+msg.data.context});
});

function getContextMessage(msg){
	return "In /r/"+msg.subreddit;
}

function getTitle(msg){
	var kind;
	switch(msg.kind){
		case "t1": kind =  "Comment";
		case "t2": kind = "Account";
		case "t3": kind = "Link";
		case "t4": kind = "Message";
		case "t5": kind = "Subreddit";
		case "t6": kind = "Award";
		case "t8": kind = "Comment";
	}
	return kind+" from "+ msg.data.author;
}

chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.get(undefined, function(items){
		if (!items.jsonFeed) chrome.tabs.create({"url": "chrome://extensions/?options="+chrome.runtime.id});
		if (!items.periodInMinutes || !items.periodInSeconds || !items.notifications){
			chrome.storage.sync.set({
				"periodInMinutes": 1,
				"periodInSeconds": 0,
				"notifications": true});
		}
	});
});

chrome.storage.sync.get(undefined, function(items){
	createAlarm(undefined, parseInt(items.periodInMinutes)+parseInt(items.periodInSeconds)/60);
	refresh();
});
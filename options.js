document.addEventListener("DOMContentLoaded", function(){
	periodInMinutes = document.getElementById("periodInMinutes");
	periodInSeconds = document.getElementById("periodInSeconds");
	jsonFeed = document.getElementById("jsonFeed");
	notifications = document.getElementById("notifications");
	
	save.addEventListener("click", saveSettings);
	
	//console.log(notifications.checked);
	
	chrome.storage.sync.get(undefined, function(items){
		periodInMinutes.value = items.periodInMinutes;
		periodInSeconds.value = items.periodInSeconds;
		jsonFeed.value = items.jsonFeed;
		notifications.checked = items.notifications;
	});
	
});

function saveSettings(){
	console.log("Saved");
	chrome.storage.sync.set({
		"periodInMinutes": periodInMinutes.value,
		"periodInSeconds": periodInSeconds.value,
		"jsonFeed": jsonFeed.value,
		"notifications": notifications.checked},
		function(){
			var status = document.getElementById('status');
			status.textContent = 'Options saved.';
			setTimeout(function() {
				status.textContent = '';
			}, 1750);
		}
	);	
}


chrome.browserAction.onClicked.addListener(function(tab) {

	chrome.tabs.executeScript({
		file: 'snap.js'
	}, res => console.log( 'result', res ) );

});

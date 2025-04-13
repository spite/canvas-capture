// background.js
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["snap.js"],
    });
    console.log("Script executed successfully.");
  } catch (error) {
    console.error("Error executing script:", error);
  }
});

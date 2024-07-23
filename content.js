// console.log('Content script loaded');
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      console.log("hitting end: ", document.body.innerText)
      if (request.action === "scrapePage")
        sendResponse({url: sender.tab.url, content: document.body.innerText});
      return true;
    }
  );
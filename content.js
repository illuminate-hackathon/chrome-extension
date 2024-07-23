console.log('Content script loaded');
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.action === "scrapePage")
        sendResponse(document.body.innerText);
      return true;
    }
  );
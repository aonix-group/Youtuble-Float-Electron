function openApplication(url) {
  chrome.tabs.getSelected(null, function (tab) {
    // Stop video
    chrome.tabs.executeScript(null, {
      code: "document.querySelector('.ytp-play-button.ytp-button').click()"
    })

    // Open External APP
    const a = document.createElement('a')
    a.href = `aonix-youtube-float://${url}`
    a.target = '_blank'
    a.click()
  })
}

const CONTEXT_MENU_ID = 'aonix-youtube-float'
chrome.contextMenus.create({
  id: CONTEXT_MENU_ID,
  title: "Abrir em janela Flutuante",
  contexts: ["link"]
})

chrome.contextMenus.onClicked.addListener(function (info) {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    openApplication(info.linkUrl)
  }
})

chrome.pageAction.onClicked.addListener(function (tab) {
  const { url } = tab
  openApplication(url)
})

// Enable page click on YouTube page
chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlContains: 'youtube.com' },
        })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }])
  })
})
"use strict";

/*
 * Perimte definir en que origin va a funcionar el complemento
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlContains: 'https://script.google.com/*' }
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
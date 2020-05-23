"use strict";

/*
 * Perimte definir en que origin va a funcionar el complemento
 */
/*chrome.runtime.onInstalled.addListener(() => {
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
});*/

/**
 * Permite definir una tarea para que agregue el archivo js a la pagina principal
 */
/*chrome.runtime.onMessage.addListener(
  function(message, callback) {
    console.log(message)
      // validamos si el mensaje es agregar el script a la página
    if (message == 'addJavascript') {
      console.log('AQUI')
        // Agregamos el archivo JS
        chrome.tabs.executeScript({
          file: 'js/gas_Tools.js'
        }, () => chrome.runtime.lastError);
    }

  }
);*/


//window.postMessage({ type: "FROM_PAGE", text: "Hello from the webpage!" }, "*");
// listen for our browerAction to be clicked
/*chrome.browserAction.onClicked.addListener(function(tab) {
  console.log(tab)
    // for the current tab, inject the "inject.js" file & execute it
  chrome.tabs.executeScript(tab.ib, {
    file: 'js/gas_Tools.js'
  });
});*/
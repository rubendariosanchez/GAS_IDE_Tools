"use strict";
// Google Apps Script se basa del proyecto "CodeMirror" : https://codemirror.net/
// Proyecto que nos puede ayudar - https://github.com/leonhartX/gas-github/blob/master/src
// iniciamos el aplicativo, despues de agregar el contenido HTML

  initPageContent();
//initPageContent();
/*chrome.runtime.sendMessage("addJavascript", function(response) {
  if (!window.chrome.runtime.lastError) {
    console.log(response);
  }
});*/


/**
 * Función para agregar el contenido de la pagina
 */
function initPageContent() {
  console.log('BIIIIIII');
  var s = document.createElement('script');
  // TODO: add "script.js" to web_accessible_resources in manifest.json
  s.src = chrome.runtime.getURL('js/gasTools.js');
  s.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
  /*return Promise.all([
      $.get(chrome.runtime.getURL('js/gas_Tools.js'))
    ])
    .then((content) => {
      console.log('BIIIIIIIss');
      // agregamos el contenido del archivo referenciado en Gmail
      $("body").append(
        $('<script>').html(content[0])
      );
    }).catch((e) => {
      console.log(e)
    });*/

  //$('head').append('<script src="https://codemirror.net/lib/codemirror.js"></script>');
  //$('head').append('<script src="https://codemirror.net/addon/hint/javascript-hint.js"></script>');
  //$('head').append('<script src="https://codemirror.net/addon/hint/show-hint.js"></script>');
  // Agregamos un evento ara identificar cuando se digita una palabra
  //$('body').on('keyup', verifyElements);

}

/**
 * Permite validar si debe analizar la información y mostrar el autocomplete
 * :commands -> https://codemirror.net/doc/manual.html#commands
 * :DOC -> https://codemirror.net/doc/manual.html
 */
function verifyElementsw(event) {
  var editor = document.querySelector('.CodeMirror')['CodeMirror'];
  console.log("editor", editor)
    //document.querySelector('.CodeMirror').CodeMirror.execCommand('indentAuto')
    // Se valida si no existe la instancia del editor
    /*if (!G_EDITOR) {

      // variable para manejar la instancia del editor
      G_EDITOR = $('.CodeMirror').CodeMirror;

      //Select editor loaded in the DOM
      var myEditor = $(".CodeMirror");
      console.log(myEditor);
      console.log(myEditor[0].CodeMirror);
    }*/
  console.log(event)
    // se referencia el elemento dode se agrego algun caracter
  var $element = $(event.target);
  //console.log($element.val())
  // referenciamos el padre del entorno de edición
  var $parent = $element.closest('.CodeMirror');

  // se valida que se encuentra dentro de un contenedor con la clase "CodeMirror"
  if ($parent.length > 0) {

    // refrenciamos la ubicación de donde esta el cursor
    var $cursor = $(".CodeMirror-cursor");

    // Obtenemos la posición en top del cursor
    var offsetTop = $cursor[0].offsetTop;

    // obtenemos el tamaños de cada linea
    var lineSize = $cursor[0].clientHeight;

    // obtenemos la linea actual
    var currentLine = (offsetTop / lineSize) + 1;

    // referenciamos la línea que se esta editando
    var $lineEdit = $('.CodeMirror-lines div > div:eq(2) pre:nth-child(' + currentLine + ')');

    //$element.val('OK.sss.')
    /*console.log('Linea actual: ', currentLine);
    console.log($lineEdit.html())
    console.log($cursor);
    console.log($parent)
    console.log(document.querySelector('.CodeMirror'))*/
  }

}

function getCompletionss(token, context) {
  console.log(token, context)
  var found = [],
    start = token.string;

  function maybeAdd(str) {
    if (str.indexOf(start) == 0) found.push(str);
  }

  function gatherCompletions(obj) {
    if (typeof obj == "string") forEach(stringProps, maybeAdd);
    else if (obj instanceof Array) forEach(arrayProps, maybeAdd);
    else if (obj instanceof Function) forEach(funcProps, maybeAdd);
    for (var name in obj) maybeAdd(name);
  }

  if (context) {
    // If this is a property, see if it belongs to some object we can
    // find in the current environment.
    var obj = context.pop(),
      base;
    if (obj.className == "js-variable")
      base = window[obj.string];
    else if (obj.className == "js-string")
      base = "";
    else if (obj.className == "js-atom")
      base = 1;
    while (base != null && context.length)
      base = base[context.pop().string];
    if (base != null) gatherCompletions(base);
  } else {
    // If not, just look in the window object and any local scope
    // (reading into JS mode internals to get at the local variables)
    for (var v = token.state.localVars; v; v = v.next) maybeAdd(v.name);
    gatherCompletions(window);
    forEach(keywords, maybeAdd);
  }
  return found;
}
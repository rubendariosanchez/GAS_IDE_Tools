/**
 * Creamos la clase de funciones personalizadas del editor, la trabajamos como prototipo para que funcione en todos las versiones de chrome
 */
function GasTools(element) {

  // definimos una variable que determina que esa va a ser la principal de la clase
  // var _this = this;

  // referenciamos el editor de Google Apps Script
  this.editor = element.CodeMirror;
  this.element = element;

  // establecemos que el this de las siguientes funciones es el this de la clase
  this.autocomplete = this.autocomplete.bind(this);
  this.showErrorIde = this.showErrorIde.bind(this);
  this.scriptHint = this.scriptHint.bind(this);
}

/**
 * Establecemos las teclas que no aplican para el autocompletado
 */
GasTools.prototype.notKeys = {
  //"8": "backspace",
  "9": "tab",
  "13": "enter",
  "16": "shift",
  "17": "ctrl",
  "18": "alt",
  "19": "pause",
  "20": "capslock",
  "27": "escape",
  "33": "pageup",
  "34": "pagedown",
  "35": "end",
  "36": "home",
  "37": "left",
  "38": "up",
  "39": "right",
  "40": "down",
  "45": "insert",
  "46": "delete",
  "91": "left window key",
  "92": "right window key",
  "93": "select",
  "107": "add",
  "109": "subtract",
  "110": "decimal point",
  "111": "divide",
  "112": "f1",
  "113": "f2",
  "114": "f3",
  "115": "f4",
  "116": "f5",
  "117": "f6",
  "118": "f7",
  "119": "f8",
  "120": "f9",
  "121": "f10",
  "122": "f11",
  "123": "f12",
  "144": "numlock",
  "145": "scrolllock",
  "186": "semicolon",
  "187": "equalsign",
  "188": "comma",
  "189": "dash",
  "190": "period",
  "191": "slash",
  "192": "graveaccent",
  "220": "backslash",
  "222": "quote"
};

/**
 * Método para inicializar la clase
 */
GasTools.prototype.init = function() {

  // validamos si la instancia del editor existe
  if (this.editor) {

    // obtenemos el nombre del archivo a procesar
    var fileName = document.querySelector('.gwt-TabLayoutPanelTabs .gwt-TabLayoutPanelTab-selected .gwt-Label').innerHTML;

    // referenciamos el this de la clase
    var _this = this;

    // obtenemos la extensión del archivo
    var extension = fileName.replace(/^.*\./, '');

    // se valida si es un archivo html
    if (extension == 'html') {

      // se ajusta la funcionalidad de la tecla superior o inferior
      this.editor.setOption("extraKeys", {
        "Up": function(cm) {
          // obtenemos el elemento de la lista de autocomplete
          var __isSuggestionUp = document.querySelector('#ctnJsAutocomplete .gas-item-selected');

          // se valida que exista un elemento seleccionado
          if (!__isSuggestionUp) {

            // se mueve el cursos a una determinada linea
            return cm.execCommand('goLineUp'); //cm.moveV(-1, "line");
          }
        },
        "Down": function(cm) {
          // obtenemos el elemento de la lista de autocomplete
          var __isSuggestionDown = document.querySelector('#ctnJsAutocomplete .gas-item-selected');

          // se valida que exista un elemento seleccionado
          if (!__isSuggestionDown) {

            // se mueve el cursos a una determinada linea
            return cm.execCommand('goLineDown');
          }
        },
        "Enter": function(cm) {
          // obtenemos el elemento de la lista de autocomplete
          var __isSuggestionEnter = document.querySelector('#ctnJsAutocomplete .gas-item-selected');

          // se valida que exista un elemento seleccionado
          if (!__isSuggestionEnter) {

            // se mueve el cursos a una determinada linea
            return cm.execCommand('newlineAndIndent');
          }
        },
        "Ctrl-Space": function(cm) {
          console.log('Enter', cm);
        }
      });
    }


    // agregamos un evento al área de textos del editor
    this.editor.getInputField().addEventListener('keyup', function(event) {
      console.log(event);
      // se valida si es un archivo html
      if (extension == 'html') {

        // obtenemos el elemento de la lista de autocomplete
        var __isSuggestion = document.querySelector('#ctnJsAutocomplete .gas-item-selected');

        // Eliminamos cualquier menu de sugerencias de Google
        removeElementsByQuery('.gwt-PopupPanel.autocomplete:not(#ctnJsAutocomplete)');
        if (event.keyCode == 32 && event.ctrlKey) return false;
        // referenciamos el cursor y obtenemos el token
        var __Cursor = _this.editor.getCursor();
        var __Token = _this.editor.getTokenAt(__Cursor);

        // se valida que la tecla marcada no sea una de la lista y que no se aun tag o un elemento de html
        if (event.ctrlKey == false && !_this.notKeys[(event.keyCode || event.which).toString()] && (__Token.className != "tag" && __Token.string != " " && __Token.string != "<" && __Token.string != "/")) {

          // llama la función de autocompletado
          _this.autocomplete(fileName);

        } else if (!__isSuggestion || (__isSuggestion && [38, 40].indexOf(event.keyCode) == -1)) { //Se valida si que no exista sugerencias o si existe que no sea la flecha de arriba o la de abajo

          // Eliminamos cualquier menu de sugerencias de Google y las personalizas
          removeElementsByQuery('.gwt-PopupPanel.autocomplete');
        }
      }

      //Realizamos el siguiente proceso si no son flechas o un comando de 2 teclas o mas
      if ([37, 38, 39, 40, 17, 27].indexOf(event.keyCode) == -1 && event.ctrlKey == false) {

        // se muestra el error cada vez que se escribe algo
        _this.showErrorIde(fileName);
      }

    });

  }

};

/**
 * Creamos propiedad para almacenar la lista de palabras claves
 */
GasTools.prototype.keywordsList = {
  javascriptKeywords: ("break case catch continue debugger default delete do else false finally for function " +
    "if in instanceof new null return switch throw true try typeof var void while with").split(" "),
  stringProps: ("charAt charCodeAt indexOf lastIndexOf substring substr slice trim trimLeft trimRight " +
    "toUpperCase toLowerCase split concat match replace search").split(" "),
  arrayProps: ("length concat join splice push pop shift unshift slice reverse sort indexOf " +
    "lastIndexOf every some filter forEach map reduce reduceRight ").split(" "),
  funcProps: "prototype apply call bind".split(" "),
  coffeescriptKeywords: ("and break catch class continue delete do else extends false finally for " +
    "if in instanceof isnt new no not null of off on or return switch then throw true try typeof until void while with yes").split(" ")
};

/**
 * Método para autocompletar texto de js
 */
GasTools.prototype.autocomplete = function(fileName) {

  // validamos si la instancia del editor existe
  if (this.editor) {

    // obtenemos la extensión del archivo
    var extension = fileName.replace(/^.*\./, '');

    // validamos si la extensión es diferente de gs y html
    if (extension == 'html') {

      // mostramos el autocomplete de javascript
      var suggestions = this.scriptHint(this.editor, this.keywordsList);

      // mostramos las sugerencias
      this.showHint(this.editor, suggestions);

    }
  }

};

/**
 * Método para obtener os datos necesario para mostrar el autocompletable
 */
GasTools.prototype.showHint = function(editor, suggestions) {

  // Eliminamos cualquier instancia que muestre un autocomplete
  removeElementsByQuery('.gwt-PopupPanel.autocomplete:not(#ctnJsAutocomplete)');

  // validamos si no hay necesidad de mostrar las sugerencias
  if (!suggestions || suggestions.list.length == 0) {

    // eliminamos la lista de sugerencias de js
    removeElementsByQuery('#ctnJsAutocomplete');

    // salimos del ciclo
    return false;

  };

  // obtenemos la posición del elemento
  var offset = getOffset(editor.getInputField());

  // definimos el left y el top
  var left = offset.left,
    top = (offset.top + 20);

  // Se valida si ya existe el contenedor con el objetivo de no volver a crearlo
  var contentSuggestions = document.querySelector('#ctnJsAutocomplete');

  // referenciamos por si ya existe el elemento
  if (contentSuggestions) {

    // establecemos la nueva posición
    contentSuggestions.setAttribute("style", "left: " + left + "px; top: " + top + "px;");

    // obtenemos el contenedor actual
    var currentContentItems = document.querySelector('#ctnJsAutocomplete .scroll-wrapper div[role="menu"]');

    // Eliminamos el contenido
    currentContentItems.innerHTML = '';

    // agregamos las sugerencias
    this.addSuggestions(editor, suggestions, currentContentItems);
  } else {

    // creamos el contenedor de las opciones
    contentSuggestions = document.createElement('div');
    contentSuggestions.setAttribute("id", "ctnJsAutocomplete");
    contentSuggestions.setAttribute("class", "gwt-PopupPanel autocomplete");
    contentSuggestions.setAttribute("style", "left: " + left + "px; top: " + top + "px;");

    // creamos el contenedor secundario
    var contentSecondary = document.createElement('div');
    contentSecondary.setAttribute("class", "popupContent");

    // creamos el contenedor del scroll
    var contentScroll = document.createElement('div');
    contentScroll.setAttribute("class", "scroll-wrapper");

    // creamos el contenedor principal de los items
    var contentMainItems = document.createElement('div');

    // creamos el contenedor de los items
    var contentItems = document.createElement('div');
    contentItems.setAttribute("role", "menu");
    contentItems.setAttribute("aria-hidden", "false");

    // agregamos las sugerencias
    this.addSuggestions(editor, suggestions, contentItems);

    // agrupamos cada uno de los elementos
    contentMainItems.appendChild(contentItems);
    contentScroll.appendChild(contentMainItems);
    contentSecondary.appendChild(contentScroll);
    contentSuggestions.appendChild(contentSecondary);
    document.body.appendChild(contentSuggestions);
  }
}

/**
 * Método que permite agregar cada una de las sugerencias
 */
GasTools.prototype.addSuggestions = function(editor, suggestions, contentItems) {
  // recorremos cada una de las sugerencias
  for (var i = 0; i < suggestions.list.length; i++) {

    // creamos el contenedor de los items
    var item = document.createElement('div');
    item.setAttribute("class", "gwt-Label item ");
    item.setAttribute("role", "menuitem");
    item.innerHTML = suggestions.list[i];

    // Agregamos el evento clic para que reemplacé los datos
    item.onclick = function(e) {

      // obtenemos el texto
      var newText = e.target.innerHTML;

      // obtenemos la nueva posición
      var newCh = suggestions.from.ch + newText.length;

      // actualizamos el valor
      editor.replaceRange(newText, suggestions.from, suggestions.to);

      // Establecemos el focus en el editor
      editor.focus();

      // Colocamos el cursor en la nueva posición
      editor.setCursor({ ch: newCh, line: suggestions.from.line });
    };

    // Agregamos la clase a seleccionar y le damos focus
    if (i == 0) {

      // agrega la clase
      item.classList.add('gas-item-selected');

      // enfocamos el item
      item.focus();
    }

    // agrupamos cada uno de los elementos
    contentItems.appendChild(item);
  }
}

/**
 * Método para obtener os datos necesario para mostrar el autocompletable
 */
GasTools.prototype.scriptHint = function(editor, keywordsList) {

  // obtenemos la información del cursor y de la linea donde este se encuentra
  var cur = editor.getCursor(),
    token = editor.getTokenAt(cur),
    tprop = token;

  // Se valida si existe un tipo y es un comentario o string para salir y no mostrar ningún autocompletable
  if (/\b(?:string|comment|tag)\b/.test(token.className)) return;

  // obtenemos el estado
  token.state = window.CodeMirror.innerMode(editor.getMode(), token.state).state;

  // Si no es un token de 'estilo de palabra', ignore el token.
  if (!/^[\w$_]*$/.test(token.string)) {

    // Definimos un nuevo token
    token = tprop = {
      start: cur.ch,
      end: cur.ch,
      string: "",
      state: token.state,
      className: token.string == "." ? "property" : null
    };
  }

  // Si es una propiedad, averigüe de qué es una propiedad.
  while (tprop.className == "property") {
    tprop = editor.getTokenAt(Pos(cur.line, tprop.start));
    if (tprop.string != ".") return;
    tprop = editor.getTokenAt(Pos(cur.line, tprop.start));
    if (!context) var context = [];
    context.push(tprop);
  }

  // retornamos la información de las posibles palabras a completar
  return {
    list: this.getCompletions(token, context, keywordsList),
    from: Pos(cur.line, token.start),
    to: Pos(cur.line, token.end)
  };
}

/**
 * Permite obtener las posibles sugerencias de acuerdo a la palabra que sigue
 */
GasTools.prototype.getCompletions = function(token, context, keywordsList) {

  // definimos al variables a retornar y el texto actual
  var found = [],
    start = token.string;

  // Se define las palabra base de js
  var keywords = keywordsList.javascriptKeywords;

  /**
   * Función que permite validar si es una sugerencia valida para agregarla
   */
  function maybeAdd(str) {

    // se valia que sea una sugerencia valida y que ya no exista
    if (str.lastIndexOf(start, 0) == 0 && !arrayContains(found, str)) found.push(str);
  }

  /**
   * Permite obtener las terminaciones, es decir las propiedades o métodos nativas de un tipo de elemento
   */
  function gatherCompletions(obj) {

    if (typeof obj == "string") forEach(keywordsList.stringProps, maybeAdd);
    else if (obj instanceof Array) forEach(keywordsList.arrayProps, maybeAdd);
    else if (obj instanceof Function) forEach(keywordsList.funcProps, maybeAdd);
    for (var name in obj) maybeAdd(name);
  }

  /**
   * Permite recorrer una lista y ejecutar una respectiva función
   */
  function forEach(arr, f) {
    for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
  }

  /**
   * Permite validar si un elemento ya existe en la lista
   */
  function arrayContains(arr, item) {
    if (!Array.prototype.indexOf) {
      var i = arr.length;
      while (i--) {
        if (arr[i] === item) {
          return true;
        }
      }
      return false;
    }
    // Se usa el método de indexOf si la instancia de Array ya lo tiene definido
    return arr.indexOf(item) != -1;
  }

  // Se define si tiene un contesto es decir, se refiere a una propiedad
  if (context && context.length) {

    // Si esta es una propiedad, mira si pertenece a algún objeto que podamos
    // buscar en el entorno actual y tomamos el ultimo contexto
    var obj = context.pop(),
      base;

    // se valida si es una variable lo que se encuentra diligenciando
    if (obj.className && obj.className.indexOf("variable") === 0) {

      // se toma como base una propiedad de windows con el texto escrito
      base = base || window[obj.string];
    } else if (obj.className == "string") {

      // no se define ninguna base
      base = "";
    } else if (obj.className == "atom") {
      base = 1;
    } else if (obj.className == "function") {

      // Se valida si las propiedades vienen de un elemento Jquery
      if (window.jQuery != null && (obj.string == '$' || obj.string == 'jQuery') && (typeof window.jQuery == 'function')) {
        base = window.jQuery();
      } else if (window._ != null && (obj.string == '_') && (typeof window._ == 'function')) {
        base = window._();
      }
    }

    // Se valida que realmente se tenga un objeto base y sea la búsqueda del contexto como tal para tomar como base la ultima concurrencia
    while (base != null && context.length) {
      base = base[context.pop().string];
    }

    // si aun existe una base en enviá para analizar cada uno de los items y agregarlos a la lista
    if (base != null) gatherCompletions(base);
  } else {
    // Si no, solo mira el objeto de la ventana y cualquier ámbito local
    // (leyendo en el modo interno JS para obtener las variables locales y globales)
    for (var v = token.state.localVars; v; v = v.next) maybeAdd(v.name);
    for (var v = token.state.globalVars; v; v = v.next) maybeAdd(v.name);
    gatherCompletions(window);
    forEach(keywords, maybeAdd);
  }

  // retornamos la lista de sugerencias
  return found;
}

/**
 * Método crea el elemento para mostrar el error
 */
GasTools.prototype.makeMarkerError = function(gutterElement, line, reasonList) {

  // referenciamos el elemento donde se debe mostrar el error
  var markerError = gutterElement.querySelector('pre:nth-child(' + line + ')');

  // creamos el contenedor del mensaje
  var errorMessage = document.createElement('div');
  errorMessage.classList.add('gas-error-message');
  markerError.appendChild(errorMessage);

  // variables que determinan si warnins o errores
  var warningCount = 0,
    errorCount = 0;

  // creamos un ciclo para agregar las razones
  for (var i = 0; i < reasonList.length; i++) {

    // creamso el contenedor del error
    var divReason = document.createElement('div');
    divReason.innerHTML = reasonList[i].reason;
    errorMessage.appendChild(divReason);

    // validamos si es un warning
    if (reasonList[i].severity == 'warning') {

      // aumentamos el contador de warnings
      warningCount++;

      // agregamos la clase al elemento para mostrar icono
      divReason.classList.add('gas-warning-item');
    } else {
      // aumentamos el contador de errores
      errorCount++;

      // agregamos la clase al elemento para mostrar icono
      divReason.classList.add('gas-error-item');
    }
  }

  // validamos si solo existe warnings
  if (warningCount > 0 && errorCount == 0) {

    // Agregamos la clase de warning
    markerError.classList.add('gas-warning-marker');

  } else if (errorCount > 0 && warningCount > 0) { // errores y warnings

    // Agregamos la clase de multiple error
    markerError.classList.add('gas-error-marker-multiple');
  } else { // errores y warnings

    // Agregamos la clase de solo error
    markerError.classList.add('gas-error-marker');
  }
}

/**
 * Método que permite mostrar los errores en el editor
 */
GasTools.prototype.showErrorIde = function(fileName) {

  // obtenemos la extensión del archivo
  var extension = fileName.replace(/^.*\./, '');

  // validamos si la extensión es diferente de gs y html
  if (['gs', 'html'].indexOf(extension) == -1) return false;

  // obtenemos el valor del archivo
  var currValue = this.editor.getValue();

  // variable para recopilar ls errores
  var errors = [];

  // se valida si la extensión es 'GS'
  if (extension == 'gs') {

    // se procesa con la librería de JsHint - https://thecodebarbarian.com/building-a-code-editor-with-codemirror.html
    JSHINT(currValue);

    // Se consulta la lista de errores
    errors = Array.isArray(JSHINT.errors) ? JSHINT.errors : [];

  } else {

    // obtenemos los errores del archivo HTML
    errors = this.getValueByHtml(currValue);
  }

  // obtenemos el contenedor de los números de lineas
  var gutterElement = this.editor.getGutterElement().querySelector('div.CodeMirror-gutter-text');

  // Eliminamos cada uno de los errores existentes
  this.clearErrors(gutterElement);

  // obtenemos la lista de errores agrupados
  var groupErrors = this.groupErrors(errors);

  // se recorre cada uno de los errores
  for (var line in groupErrors) {

    // mostramos el respectivo error
    this.makeMarkerError(gutterElement, line, groupErrors[line]);
  }

};

/**
 * Permite agrupar los errores de acuerdo a una linea
 */
GasTools.prototype.getValueByHtml = function(valueHtml) {

  // variable para recopilar ls errores
  var errors = [];

  // variable para contar cuantas líneas hay hasta el momento
  var script_line = [],
    match = null,
    scriptContent = [];

  // obtener las líneas de etiqueta del script para agregar el recuento de líneas cuando se muestran errores
  valueHtml.split('\n').forEach(function(str, i) {
    if (str.indexOf('<script') > -1) {
      script_line.push(i);
    }
  });

  // definimos la expresión regular que permite obtener el contenido dentro de un script
  var regexp = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;

  // obtenemos la cantidad de etiquetas
  var scriptTags = valueHtml.match(regexp);

  // validamos si es null la cantidad de tags para salir de la función
  if (!scriptTags) return errors;

  // obtener todo el contenido de la etiqueta del script
  for (var i = 0; i < scriptTags.length; i++) {

    // Agregamos el contenido de cada script
    scriptContent.push(regexp.exec(scriptTags[0])[1]);
  }

  // validamos si existe mas de un script en el documento
  if (scriptContent.length > 0) {

    // Se recorre cada una de las líneas
    scriptContent.forEach(function(s, idx) {

      try {
        JSHINT(s);

        // Se consulta la lista de errores temporalmente
        var errorsTemp = Array.isArray(JSHINT.errors) ? JSHINT.errors : [];

        // se valida que existan errores
        if (errorsTemp) {

          // Se recorre cada uno de los errores con el objetivo de actualizar la linea
          errorsTemp.forEach(function(e) {

            // errores encontrados en el formato
            if (e.raw) {

              // Agregamos el error a la lista
              errors.push({
                line: e.line + script_line[idx],
                reason: e.reason,
                code: e.code
              });
            }

          });
        }
      } catch (e) {}
    });
  }

  // retornamos la lista de errores
  return errors;

}


/**
 * Permite agrupar los errores de acuerdo a una linea
 */
GasTools.prototype.groupErrors = function(errors) {

  // inicializamos la variable por si viene en null o undefined
  errors = errors || [];

  // creamos variable para retornar la lista de errores
  var errorObject = {};

  // recorremos cada una de la lista
  for (var i = 0; i < errors.length; i++) {

    // se valida si existe una linea y una razon del error
    if (errors[i].line && errors[i].reason) {

      // validamos si aun no existe una propiedad asociada a la linea
      if (!errorObject[errors[i].line]) {

        // inicializamos la propiedad
        errorObject[errors[i].line] = [];
      }

      // agregamos la razon en la línea respectiva
      errorObject[errors[i].line].push({
        severity: errors[i].code ? (errors[i].code.startsWith('W') ? "warning" : "error") : "error",
        reason: errors[i].reason
      });

    }

  }

  // retornamos el objeto
  return errorObject;
}

/**
 * Eliminamos los errores de la lista de errores del archivo actual
 */
GasTools.prototype.clearErrors = function(gutterElement) {

  // Eliminamos todos los elementos que tienes la clase 'gas-error-marker'
  gutterElement.querySelectorAll('.gas-error-marker').forEach(function(el) {

    // se remueve cada la clase del elemento
    el.classList.remove('gas-error-marker');
  });

  // Eliminamos todos los elementos que tienes la clase 'gas-warning-marker'
  gutterElement.querySelectorAll('.gas-warning-marker').forEach(function(el) {

    // se remueve cada la clase del elemento
    el.classList.remove('gas-warning-marker');
  });

  // Eliminamos todos los elementos que tienes la clase 'gas-error-marker-multiple'
  gutterElement.querySelectorAll('.gas-error-marker-multiple').forEach(function(el) {

    // se remueve cada la clase del elemento
    el.classList.remove('gas-error-marker-multiple');
  });

  // Eliminamos todos los elementos que tienes la clase 'gas-error-message'
  gutterElement.querySelectorAll('.gas-error-message').forEach(function(el) {

    // se remueve cada elemento
    el.remove();
  });
}

// se llama la función que inicializar el Ide personalizado
initCustomIde();

/**
 * Permite inicializar las funciones personalizadas del editor
 */
function initCustomIde() {

  // Elegimos el elemento donde se va a crear un observador  para identificar si se realiza alguna modificación
  // se usa un API de Javascript: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
  var targetNode = document.getElementsByClassName('gwt-TabLayoutPanelTabs')[0];

  // Se deine los parametros de configuración del observador: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit
  var configObserver = { attributes: true, childList: true, subtree: true };

  // Crear una instancia de observador vinculada a la función de devolución de llamada
  var observerDom = new MutationObserver(function(mutationsList) {

    // recorremos cada uno de las mutaciónes o cambios existentes
    for (var i = 0; i < mutationsList.length; i++) {

      // Valdiamos si el cambio fuen el la lista de hijos
      if (mutationsList[i].type === 'childList') {

        // validamos si existe nuevas instancias del editor para agregar las funcionalidades extras
        settingEditorGas();
      }
    }
  });

  // Comience a observar el nodo objetivo para las mutaciones configuradas
  observerDom.observe(targetNode, configObserver);

  // configuramos en primera instancia el primer editor
  settingEditorGas();

  // Agregamso funcionalida para cerrar sugerencias
  document.body.addEventListener('click', function() {

    // Eliminamos cualquier instancia que muestre un autocomplete
    removeElementsByQuery('#ctnJsAutocomplete.autocomplete');
  });

  // Adding event listener on the page-
  document.addEventListener('keydown', handleInputFocusTransfer);

  // Agregamso funcionalida para cerrar sugerencias
  document.body.addEventListener('click', function() {

    // Eliminamos cualquier instancia que muestre un autocomplete
    removeElementsByQuery('#ctnJsAutocomplete.autocomplete');
  });

  // se establece el observador para actualizar el icono
  setCustomIcons();
}


/**
 * Permite establecer la función de establecer los iconos
 */
function setCustomIcons() {
  // Elegimos el elemento donde se va a crear un observador  para identificar si se realiza alguna modificación
  // se usa un API de Javascript: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
  var targetNode = document.getElementsByClassName('project-items-list')[0];

  // Se deine los parametros de configuración del observador: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit
  var configObserver = { attributes: true, childList: true, subtree: true };

  // Crear una instancia de observador vinculada a la función de devolución de llamada
  var observerDom = new MutationObserver(function(mutationsList) {

    // recorremos cada uno de las mutaciónes o cambios existentes
    for (var i = 0; i < mutationsList.length; i++) {

      // Valdiamos si el cambio fuen el la lista de hijos
      if (mutationsList[i].type === 'childList') {

        // se actualiza el icono
        updateCustomIcon();
      }
    }
  });

  // Comience a observar el nodo objetivo para las mutaciones configuradas
  observerDom.observe(targetNode, configObserver);

  // se actualiza el icono
  updateCustomIcon();
}

/**
 * Permite actualizar el icono de la lista de archivos
 */
function updateCustomIcon() {
  // Recorremos cada uno de los items que no tienen el icono personalizado
  document.querySelectorAll('.project-items-list>div:not(.gas-custom-icon)').forEach(function(element) {

    // Obtenemos el nombre del archivo
    var fileName = element.getAttribute('aria-label');

    // se valida que existe nombre
    if (fileName) {

      // obtenemos la extensión del archivo
      var extension = fileName.replace(/^.*\./, '');

      // definimos el icono para cada tipo de extensión
      var iconType = {
        'html': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKWSURBVDiNjZM7aFNhFMd/J7k1XJObaIJpFRXUKgUdxJpSUVChqIOiiCA2o6I4WOpQKKhQF0EdFKylqAgK6uIiSDv4GGqxioiPQahtrYKPoqk098bEJjf3OMS0qTr4n77v4/xfBz5RVcoQkd3t7e0TwWBw/9jY2Jra2tr5ruuSSCReDAwMfOrp6env6+vrpgK+irPU1dWd7O3tvScizUNDQ3XxeDzS1dUVSSaTm4aHh5OxWKzTtu1WQMokf0dHB4A4jnN3fHx8fUtLi5imSTQapampiVwuR1tbG/l8nsHBQd/o6Oi2hoaGRCAQuAUgqopt263eyOtz/EjzX5ht4atdfTQcDp8X27ZXAC9zZw6YxZd9f80agZl3zwNZ3oh5/HoOWG2oarOImGJF/2lmzq1sDIUsuJEogCki+wwRqQeQSAyA0N5WZm9JTm/ZX0F+cpv8jdOUzVR1rQGUBMIlAVTxxxeSvXcLii5V5nQC78Mr1Js2A+oNESmoKr7fAt5ECoDMzbMUU1+wamZWUI+pWREpGEA/0FxO4KVLAvMuPwVVpIL888phvPs9+MNTCfqnBUqLoTD6hsztzinSrBD4YoswEjvRHxN/Vug3VPUBUBArWgWgbp5A/Waca6eYfP4QqwaMtTtKAnYKLYKEowAFVX1gWJb1NpPJHCES6wbQrEPVkpUEdx3CZ83BsIpUbdhX6u+kSgnCMUSkJRQKvUVVUVUcx7nwZc8y/by9RjN3Lmnh44iWUfz6XvMPr6p9YIF+3rVI0+l0Z5knFb/R/+3U/kfus/vrcPOlh+rFhKoNvG/vAHAnfRRWbH0879jVjYALzBAA4PuVk43Fj0MX9fvYUi/1KRwIZMULxrMaXTosC1cdih088bRy/heyQCYG+LP19AAAAABJRU5ErkJggg==',
        'gs': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAeFBMVEUAAADQ0PrO0vvU2PvP0f3x8f7P0fzv7/7P0vzj5f3tv3r1uFP1uVXvvHHtvXHqwYfpvoLP0vzb3f3Y2v3////m6P3y8/7e4P3o6f7j5f3S1fzV2PzR0/zr7P7yu2H/sin/1If/2JL/zXX/w1j/2ZX/xFr/2JMAAACZakwFAAAAEXRSTlMAMURBe8S+wL+d4u/uu7lXdvBwsEwAAAABYktHRACIBR1IAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5AUeDxEoVBeQPwAAAHxJREFUGNN1z9sSgiAQBuAtswg1kqI8Wyq+/yO2LIt043+xh2+GnQEA4HCkJMA5lT46ZTgzPJ4XD4KhNK9rgLfbsYgAlYMqgq6btm1qvUFn6EQXn/QO+r8bITsghy2SIBsxn++ENSPIcZoXu2LLCQqcrJ0stpv/jLpzFC4/H08NqmObH7EAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjAtMDUtMzBUMTU6MTc6NDArMDA6MDBGtCjqAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIwLTA1LTMwVDE1OjE3OjQwKzAwOjAwN+mQVgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII=',
        'json': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAP0AAAD9AEnGM3WAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAOpQTFRF////5+fb5+fn7OzfwK3Aw7TDvqzB3t7U4d7U4t/V6eng5eXb4+LY2tjMl3eomXqqmnuqmnurm3yrnH2snX+tn4Gun4KvoIKvoYSwpIixpYm0rZO6r5a8r5e8sZm9spq+sp26tJzAtJ3At6O+uKLDuaa/uae/uqTFuqjAu6rBvKrBvqrIvqrJwKzKwLHEwa7Lw7HNxbTPxrjIybjSybnSy7vUzb3VzcLNz8HXz8XO0snQ08Xa08vR1s/S2dfK2s7g3NfX3djY3dnY4uHW49rn4+Dc4+Hc5OTa5uXe5+be5+bf5+ff6Ojg6engljgFSwAAAA50Uk5TABUVKDVESmRlaPL19v4X3HYWAAAAnUlEQVQYV13L1RKCUACE4VUU+9jdgd3d3bDv/zpegMj43+03s4DNSz2fBwAAydh8BNx/sA+4vrBQyePucvHbDVD4plYnKelw7HN7Y/VpQntFlVTWJmgtjs9s/i4sqXft1LbAk+RLs4CZBMCZtuQEIAvRyw5io06+3BWyDrPcoJGZ1A5zAwqbzLQ4XNYqVyEDcITisUhKJMLRYDLkwAeNCSm52IA4mwAAAABJRU5ErkJggg=='
      };

      // Icono por defecto
      var defaultIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABCElEQVR4XmNgoCbQ0tJiU5SVb1aUl2+BYSU5hU5FWUU3dLVYgYKCgoCCnPxROTk5LSDbAITl5eUVFeXkPyjKyYWiq8cAIAOU5OXXo4sDDfgFxJ+U5OSc0eVQAMgARTmFVUCFPgpycnlKsvJFKioqfEDN/6H4L1DOBV0fHIC9ICu/VklJSQ7odENlOTljqLgGkK8J8hrQkNfo+uAA4gL5RUBX7ALS/9DwfwVZBX8g/QNdHxxADVijJCOjCww0V2QM1OwOlOcAyv9E1wcH1DKAMi8gByIaNgKpIcIFiGhExkqyCoVAeQkiDJBfjS6ODPAaoCUqygNU8BLogSfYMFDuKTCp30HXN7AAAKarYBD/VuTqAAAAAElFTkSuQmCC';

      // agregamos el nuevo icono
      element.querySelector('img.icon').setAttribute('src', (iconType[extension] || defaultIcon));

      // agregamos la clase para no volver a procesar
      element.classList.add('gas-custom-icon');
    }
  });
}

/**
 * Permite obtener la información de donde se encuentra un elemento dentro del dom
 */
function getOffset(element) {

  // Validamos si no existe espacios superiores o a la izquieda del elemento
  if (!element.getClientRects().length) {
    return { top: 0, left: 0 };
  }

  // obtenemos la lista de elementos que estan por encima y por debajo del elemento en referencia
  var rect = element.getBoundingClientRect();
  var win = element.ownerDocument.defaultView;

  // se retorna un objeto con la información requerida de la posición del elemento
  return ({
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset
  });
}

/**
 * Permite obtener la posisión dentro del texto
 */
function Pos(line, ch, sticky) {

  // Se valida existe el tercer parametro
  if (sticky === void 0) sticky = null;

  if (!(this instanceof Pos)) { return new Pos(line, ch, sticky) }
  this.line = line;
  this.ch = ch;
  this.sticky = sticky;
}


/**
 * Permite remover elementos del Dom de acuerdo a una query
 */
function removeElementsByQuery(query) {

  // Eliminamos cualquier menu de sugerenciancias de Google
  document.querySelectorAll(query).forEach(function(element) {

    // Eliminamos el elemento
    element.remove();
  });

}

/**
 * Valida si debe funcionar comun y corriente el keyup o debe permitir otra tarea
 */
function verifyKeyUp(cm) {

  // obtenemos el elemento de la lista de autocomplete
  var __isSuggestion = document.querySelector('#ctnJsAutocomplete .gas-item-selected');

  // se valida que exista un elemento seleccionado
  if (!__isSuggestion) {

    // se mueve el cursos a una determinada linea
    return cm.moveV(1, "line");
  }
}

/**
 * Permite navegar entre el menu de sugerencias
 */
function handleInputFocusTransfer(e) {

  // se valida si existe un campo con focus
  var focusableInputElements = document.querySelectorAll('#ctnJsAutocomplete .gas-item-selected');

  // se valida que exista un elemento seleccionado
  if (focusableInputElements.length > 0) {

    // validamos si oprimio esc
    if (event.keyCode == 27) {

      // Eliminamos cualquier instancia que muestre un autocomplete
      removeElementsByQuery('#ctnJsAutocomplete.autocomplete');
    }

    // validamos si la tecla es ENTER
    if (e.keyCode === 13) {

      // emulamos el clic en la opción seleccionada
      focusableInputElements[0].click();
    }

    // obtenemos todos los elementos de la lista
    var allElements = document.querySelectorAll('#ctnJsAutocomplete .gwt-Label'),
      currentIndex = -1;

    // recorremos la cantidad de elementos
    for (var i = 0; i < allElements.length; i++) {

      // se valida si el elementos es el actual
      if (allElements[i] == focusableInputElements[0]) {

        // obtenemos el index del elemento
        currentIndex = i;

        // salidmos del ciclo
        break;
      }
    }

    // se define cual es el proximo elemento
    var nextIndex = -1;

    // se valida si oprome la flecha de arriba
    if (e.keyCode === 38) {

      // validamos si el contados es cero
      if (currentIndex == 0) {

        // definimos como anterior el ultimo
        nextIndex = allElements.length - 1;
      } else {

        // definimos cual es proximo elemento
        nextIndex = currentIndex - 1;
      }

    } else if (e.keyCode === 40) {

      // se valida si el actual index es igual a la cantidad maxima
      if (currentIndex == allElements.length - 1) {

        // definimos como nuevo el inicio de la lisat
        nextIndex = 0;
      } else {

        // definimos cual es proximo elemento
        nextIndex = currentIndex + 1;
      }

    }

    // se valida si el proximo index es diferente a -1
    if (nextIndex != -1) {
      // removemos la clase del elemento actual
      focusableInputElements[0].classList.remove('gas-item-selected');

      // agregamos la clse al elemento
      allElements[nextIndex].classList.add('gas-item-selected');

      // mantenemos visible el items que se maneja con el scroll
      allElements[nextIndex].scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  }
}

/**
 * Permite configurar los edirores con las nuevas funcionalidades
 */
function settingEditorGas() {

  // Inicializamos todos los elementos con la clase CodeMirror
  document.querySelectorAll('.CodeMirror:not(.gas-tools-CodeMirror)').forEach(function(el) {

    // inicializamos la clase con las nuevas funciones del editor
    new GasTools(el).init();

    // agregamos la clase que determina que el lemento ya se inicializo
    el.classList.add('gas-tools-CodeMirror');
  });
}
/** - https://codemirror.net/2/demo/complete.html
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
  "8": "backspace",
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

    // Permite identificar el tipo de lenguaje a verificar en este caso es JS, GS y JSON
    var foldFunc = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);

    // Se establece la combinación de teclas Ctrl+Alt+Q
    this.editor.setOption("extraKeys", {
      "Alt-Q": function(cm) {

        // Se procede a ejecutar la función
        foldFunc(cm, cm.getCursor().line);
      }
    });

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
            return cm.execCommand('goLineUp');
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
        }
      });
    }

    // agregamos un evento al área de textos del editor
    this.editor.getInputField().addEventListener('keyup', function(event) {

      // se valida si es un archivo html
      if (extension == 'html') {

        // obtenemos el elemento de la lista de autocomplete
        var __isSuggestion = document.querySelector('#ctnJsAutocomplete .gas-item-selected');
        var __isSuggestionGoogle = document.querySelector('.gwt-PopupPanel.autocomplete:not(#ctnJsAutocomplete)');

        // referenciamos el cursor y obtenemos el token
        var __Cursor = _this.editor.getCursor();
        var __Token = _this.editor.getTokenAt(__Cursor);

        // Validamosque que no exista el panel de ayuda de google
        if (!__isSuggestionGoogle) {
          console.log(event)
          console.log('__Token', __Token);
          console.log('ITEM 1: ' + (event.ctrlKey && event.keyCode == 32));
          console.log('ITEM 1: ' + (event.ctrlKey == false && !_this.notKeys[(event.keyCode || event.which).toString()] && (__Token.className != "tag" && __Token.string != " " && __Token.string != "<" && __Token.string != "/")));
          // se valida que la tecla marcada no sea una de la lista y que no se aun tag o un elemento de html
          if ((event.ctrlKey && event.keyCode == 32) || (event.ctrlKey == false && !_this.notKeys[(event.keyCode || event.which).toString()] && (__Token.className != "tag" && / |<|\/|\(|\)/.test(__Token.string) == false && event.altKey == false))) {

            // llama la función de autocompletado
            _this.autocomplete();

          } else if (__isSuggestion && (([38, 40, 16, 17, 18].indexOf(event.keyCode) == -1))) { //Se valida si que no exista sugerencias o si existe que no sea la flecha de arriba o la de abajo

            // Eliminamos cualquier menu de sugerencias personalizado de
            removeElementsByQuery('#ctnJsAutocomplete');
          }

        } else if (__isSuggestion) { // Si existe el de Google y tambien el personalizado

          // Removemos ese panel para que no moleste
          removeElementsByQuery('#ctnJsAutocomplete');

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
GasTools.prototype.autocomplete = function() {

  // validamos si la instancia del editor existe
  if (this.editor) {

    // mostramos el autocomplete de javascript
    var suggestions = this.scriptHint(this.editor, this.keywordsList);

    // mostramos las sugerencias
    this.showHint(this.editor, suggestions);
  }

};

/**
 * Método para obtener os datos necesario para mostrar el autocompletable
 */
GasTools.prototype.showHint = function(editor, suggestions) {

  // validamos si no hay necesidad de mostrar las sugerencias
  if (!suggestions || suggestions.list.length == 0) {

    // eliminamos la lista de sugerencias de js
    removeElementsByQuery('#ctnJsAutocomplete');

    // salimos del ciclo
    return false;

  };

  // Se valida si solo es una concurrencia se ingresa de una evz
  if (suggestions.list.length == 1) {
    //insert(completions[0]);
    //return true;
  }

  // obtenemos la posición del elemento
  var offset = getOffset(editor.getInputField());

  // definimos el left y el top
  var left = offset.left,
    top = (offset.top + 20);

  // Obtenemos la altura de la pantalla
  var windowHeight = window.innerHeight,
    elementHeight = 202;

  // Se valida si ya existe el contenedor con el objetivo de no volver a crearlo
  var contentSuggestions = document.querySelector('#ctnJsAutocomplete');

  // referenciamos por si ya existe el elemento
  if (contentSuggestions) {

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

  // obtenemos la altura del elemento
  elementHeight = contentSuggestions.offsetHeight;

  // validamos si el tamaño del elemento + el top del cursor es mayor que el tamaño de la ventana
  if ((top + elementHeight) > windowHeight) {

    // Se valida si hay espacio en la parte superior del cursor
    if (top - 20 > elementHeight) {
      top -= (elementHeight + 20);
    }

  }

  // establecemos la nueva posición
  contentSuggestions.setAttribute("style", "left: " + left + "px; top: " + top + "px;");

  contentSuggestions.focus();
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

      // Establcemos el focus en el editor y el cursor al final de la linea
      setTimeout(function() {
        // Establecemos el focus en el editor
        editor.focus();

        // Colocamos el cursor en la nueva posición
        editor.setCursor({ ch: newCh, line: suggestions.from.line });
      }, 50);

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

  // obtenemos la lista de errores agrupados y la clase a establecer
  var errorsData = this.groupErrors(errors);

  // referenciamos el tab activo
  var activeTab = document.querySelector('.gwt-TabLayoutPanelTab-selected .tab-header');

  // validamos si existe una pestaña activa
  if (activeTab) {

    // Eliminamos cada uno de los errores existentes
    this.clearErrors(activeTab);

    // se valida si existe errores para mostrar
    if (Object.keys(errorsData.errorsList).length > 0) {

      // almacenamos los datos de errores
      this.setMakerError(activeTab, errorsData);
    }
  }

};

/**
 * Método crea el elemento para mostrar el error
 */
GasTools.prototype.setMakerError = function(activeTab, errorsData) {

  // creamos la opción del error a mostrar
  var errorOption = document.createElement('span');
  errorOption.classList.add(errorsData.className);
  errorOption.title = 'Haz clic para ver los errores.';
  activeTab.prepend(errorOption);

  // Agregamamos el evento al elemento
  new PopoverGas(errorOption, errorsData.errorsList);
}


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

  // Variable temporal para determinar si cumple con la condición
  var tempMatch = null;

  // obtener todo el contenido de la etiqueta del script
  for (var i = 0; i < scriptTags.length; i++) {

    // Se valida la expresión
    tempMatch = regexp.exec(scriptTags[0]);

    // Si cumple y es mayor a 1
    if (tempMatch && tempMatch.length > 1) {
      // Agregamos el contenido de cada script
      scriptContent.push(tempMatch[1]);
    }
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
  var errorsList = {},
    className = 'gas-error-marker',
    severityTemp = '';

  // variables que determinan si warnins o errores
  var warningCount = 0,
    errorCount = 0;

  // recorremos cada una de la lista
  for (var i = 0; i < errors.length; i++) {

    // se valida si existe una linea y una razon del error
    if (errors[i].line && errors[i].reason) {

      // validamos si aun no existe una propiedad asociada a la linea
      if (!errorsList[errors[i].line]) {

        // inicializamos la propiedad
        errorsList[errors[i].line] = [];
      }

      // obtenemos el tipo de error
      severityTemp = errors[i].code ? (errors[i].code.startsWith('W') ? "warning" : "error") : "error";

      // se valida si es error
      if (severityTemp == 'error') {
        // aumentamos el contador de errores
        errorCount++;
      } else {
        // aumentamos el contador de warnings
        warningCount++;
      }

      // agregamos la razon en la línea respectiva
      errorsList[errors[i].line].push({
        severity: severityTemp,
        reason: errors[i].reason
      });
    }

  }

  // validamos si solo existe warnings
  if (warningCount > 0 && errorCount == 0) {

    // Agregamos la clase de warning
    className = 'gas-warning-marker';

  } else if (errorCount > 0 && warningCount > 0) { // errores y warnings

    // Agregamos la clase de multiple error
    className = 'gas-error-marker-multiple';
  }

  // retornamos el objeto
  return {
    className: className,
    errorsList: errorsList
  };
}

/**
 * Eliminamos los errores de la lista de errores del archivo actual
 */
GasTools.prototype.clearErrors = function(activeTab) {

  // Eliminamos todos los elementos que tienes la clase 'gas-error-marker'
  activeTab.querySelectorAll('.gas-error-marker').forEach(function(el) {

    // se remueve cada elemento
    el.remove();
  });

  // Eliminamos todos los elementos que tienes la clase 'gas-warning-marker'
  activeTab.querySelectorAll('.gas-warning-marker').forEach(function(el) {

    // se remueve cada elemento
    el.remove();
  });

  // Eliminamos todos los elementos que tienes la clase 'gas-error-marker-multiple'
  activeTab.querySelectorAll('.gas-error-marker-multiple').forEach(function(el) {

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
  document.querySelectorAll('.project-items-list>div').forEach(function(element) {

    // Obtenemos el nombre del archivo
    var fileName = element.getAttribute('aria-label');

    // se valida que existe nombre
    if (fileName) {

      // obtenemos la extensión del archivo
      var extension = fileName.replace(/^.*\./, '');

      // definimos el icono para cada tipo de extensión
      var iconType = {
        'html': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKWSURBVDiNjZM7aFNhFMd/J7k1XJObaIJpFRXUKgUdxJpSUVChqIOiiCA2o6I4WOpQKKhQF0EdFKylqAgK6uIiSDv4GGqxioiPQahtrYKPoqk098bEJjf3OMS0qTr4n77v4/xfBz5RVcoQkd3t7e0TwWBw/9jY2Jra2tr5ruuSSCReDAwMfOrp6env6+vrpgK+irPU1dWd7O3tvScizUNDQ3XxeDzS1dUVSSaTm4aHh5OxWKzTtu1WQMokf0dHB4A4jnN3fHx8fUtLi5imSTQapampiVwuR1tbG/l8nsHBQd/o6Oi2hoaGRCAQuAUgqopt263eyOtz/EjzX5ht4atdfTQcDp8X27ZXAC9zZw6YxZd9f80agZl3zwNZ3oh5/HoOWG2oarOImGJF/2lmzq1sDIUsuJEogCki+wwRqQeQSAyA0N5WZm9JTm/ZX0F+cpv8jdOUzVR1rQGUBMIlAVTxxxeSvXcLii5V5nQC78Mr1Js2A+oNESmoKr7fAt5ECoDMzbMUU1+wamZWUI+pWREpGEA/0FxO4KVLAvMuPwVVpIL888phvPs9+MNTCfqnBUqLoTD6hsztzinSrBD4YoswEjvRHxN/Vug3VPUBUBArWgWgbp5A/Waca6eYfP4QqwaMtTtKAnYKLYKEowAFVX1gWJb1NpPJHCES6wbQrEPVkpUEdx3CZ83BsIpUbdhX6u+kSgnCMUSkJRQKvUVVUVUcx7nwZc8y/by9RjN3Lmnh44iWUfz6XvMPr6p9YIF+3rVI0+l0Z5knFb/R/+3U/kfus/vrcPOlh+rFhKoNvG/vAHAnfRRWbH0879jVjYALzBAA4PuVk43Fj0MX9fvYUi/1KRwIZMULxrMaXTosC1cdih088bRy/heyQCYG+LP19AAAAABJRU5ErkJggg==',
        'gs': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAALMSURBVDiNpZJNaFxlFIaf77vfnXvn3puZYYpjQichtmjjWAM1NUGobax0YUVoaYhSodaFO7ELKwgqiPgH0UVFpe6MtRUsuBFFNFQQrZhStGolhNZiq7XtpE1mJvNzv/vzuZCRbuJC3+U5nIdz3vPC/5T4t+Ztb+3tjZW81clGsz/uOdTs1h9+42pO9xY7RyeFXhEwNLV3fGP55s9HSmvsz66cunwmWho+u+fglYkD16Zu9y89GaF0O9u321oJMLB99MDU3Y9XBr1BhleVg0/Of8emrV9eHfV/n54cL4jhm2x17mJ7m7p+yPw0diNe3BFrT9aiJFpcWG7RX+zhwvkasZYPkAo3YxuUDaEG15HinxP0ibveacdbH5OyHgf548+t/7jym+f3fLA628/PS+cQnmXWt19ZHCxSXC2rxMqlbRffFgCNmQ2VjjNx+s9Vj6AsKC88g/bnvtg0MzSe9ig7jSAvh6nIRykGgrY25LKSwJVjEsCEaRyFhqwLUkLUiOmpR9s25JupNAalDAU9QuAKkvTv1zk288/v9GYVQO7+U/NLn3qvmfna/oxVI7BPgxDcU6g731/OYdkBeVHBsSGMwFYCy+JdANn1oLD926dyzExkO7MNYwtkVrD5hgZECUF8B3lPkaaQpOA7Ik2EfB9AmQf33bmczxyKnUzZn25pk2ulnfFfElNuWmtyIf22xko2ss6r0tQpoezFtjj24g7vAoCqx8sfVvc/O6ixufbmQX/gmzmcHwL0fSnR5jZjeRcnyrBj1AEBR76ugii9191capKSNjaeA7rUhzYpwi/gfDWAfbSPipEoE2IrSBPIOimtwP+oC7BeXkjS5cbSve0zf4jS4SO4tQai2cLU64hfQ26ZW2R6aAsLlyzOVqHTPHbxpcmRV7sAARDSW9Ey3aKE6UisJmCuT2jTd9XhfbseMj4nn3j69RdWiv9/0l/LcBLexRRK6AAAAABJRU5ErkJggg==',
        'json': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAB0UlEQVRIidWUP28TQRDFf7PniNYYOkIqH0iRkAicO2jTQA01CB1OiYQESChCIAVosARFzlXCNyAVBQ0FBRKXL5DjT2GXCESHgd2hwIfPvvP5sEKR1+3svPd2dmYXDjpkMnC2u3cBla7AsRnEr6o8iNf8TlmeyRFVolniAAqHEZ4Em8m9GQcZRxAlChC3/dxeUd5Q5PG7tn+7KC9XwTxQuNWKkkf/zSA1CTaTG/tooG9yIeHuZKg2r3zcPnE+ux72pJH3pPpoVkQfI2EcNl/C8IqqjmZFLOK0my7M32AG6Yiq6Lox5qQKlwAFXqNyylldBl6NcvVZlgccnzSYAu+Fc25bVFrANxWuIfrceLKtwlqaJXZhA/hSpFBqIGo7OHtFVC1Q373ufwBWgNZu2Pw4OsfPy4LeL9IYnyKho8rF5tPkEIBidsTIWyfON2qunt76VGdg9xB1K1vvj6Y0RdY9z1uuUsHn7/bHmfqC3AQQ0YYYzhn1AoUjtYF9qCKrnmG1NmAjw2v8su5O4S0ABFHSY6LRJbD8aXjZG+rFbX9pVIGREOhXNPBmiQsSTt0NokSzP2VVTOPt22c3DUWl9oHFeaoAepOBfAX/1o8x8dK7P7D4DbAQoCI5kqtLAAAAAElFTkSuQmCC'
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
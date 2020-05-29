/**
 * Creamos la clase de funciones personalizadas del editor, la trabajamos como protoripo para que funcione en todos las versiones de chrome
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
 * Establcemos las teclas que no aplican para el autocompletado
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
 * Metodo para inicializar la clase
 */
GasTools.prototype.init = function() {

  // validamos si la instancia del editor existe
  if (this.editor) {
    console.log(this);
    // obtenemso el nombre del archivo a procesar
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
            return cm.moveV(-1, "line");
          }
        },
        "Down": function(cm) {
          // obtenemos el elemento de la lista de autocomplete
          var __isSuggestionDown = document.querySelector('#ctnJsAutocomplete .gas-item-selected');

          // se valida que exista un elemento seleccionado
          if (!__isSuggestionDown) {

            // se mueve el cursos a una determinada linea
            return cm.moveV(1, "line");
          }
        }
      });
    }


    // agregamos un evento al area de textos del editor
    this.editor.getInputField().addEventListener('keyup', function(event) {

      // se valida si es un archivo html
      if (extension == 'html') {

        // obtenemos el elemento de la lista de autocomplete
        var __isSuggestion = document.querySelector('#ctnJsAutocomplete .gas-item-selected');

        // Eliminamos cualquier menu de sugerenciancias de Google
        removeElementsByQuery('.gwt-PopupPanel.autocomplete:not(#ctnJsAutocomplete)');

        // referenciamos el cursor y obtenemos el token
        var __Cursor = _this.editor.getCursor();
        var __Token = _this.editor.getTokenAt(__Cursor);

        // se valida que la tecla marcada no sea una de la lista y que no se aun tag o un elemento de html
        if (event.ctrlKey == false && !_this.notKeys[(event.keyCode || event.which).toString()] && (__Token.className != "tag" && __Token.string != " " && __Token.string != "<" && __Token.string != "/")) {

          // llama la función de autocompletado
          _this.autocomplete(fileName);

        } else if (!__isSuggestion || (__isSuggestion && [38, 40].indexOf(event.keyCode) == -1)) { //Se valida si que no exista sugerencias o si existe que no sea la flecha de arriba o la de abajo

          // Eliminamos cualquier menu de sugerenciancias de Google y las personalizas
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
  console.log('__isSuggestion', __isSuggestion);
  // se valida que exista un elemento seleccionado
  if (!__isSuggestion) {

    // se mueve el cursos a una determinada linea
    return cm.moveV(1, "line");
  }
}

// Agregamso funcionalida para cerrar sugerencias
document.body.addEventListener('click', function() {

  // Eliminamos cualquier instancia que muestre un autocomplete
  removeElementsByQuery('#ctnJsAutocomplete.autocomplete');

});

// Adding event listener on the page-
document.addEventListener('keydown', handleInputFocusTransfer);

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
 * Metodo para autocompletar texto de js
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
 * Metodo para obtener os datos necesario para mostrar el autocompletable
 */
GasTools.prototype.showHint = function(editor, suggestions) {

  // Eliminamos cualquier instancia que muestre un autocomplete
  document.querySelectorAll('.gwt-PopupPanel.autocomplete').forEach(function(element) {

    // Eliminamos el elemento
    element.remove();
  });

  // validamo si no hay necesidad de mostrar las sugerencias
  if (!suggestions || suggestions.list.length == 0) return false;

  // obtenemos la posición del elemento
  var offset = getOffset(editor.getInputField());

  // definimos el left y el top
  var left = offset.left,
    top = (offset.top + 18);

  // creamos el contenedor de las opciones
  var contentSuggestions = document.createElement('div');
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

  // recorremos cada una de las sugerencias
  for (var i = 0; i < suggestions.list.length; i++) {

    // creamos el contenedor de los items
    var item = document.createElement('div');
    item.setAttribute("class", "gwt-Label item ");
    item.setAttribute("role", "menuitem");
    item.innerHTML = suggestions.list[i];

    // Agregamos el evento clic para que reemplce los datos
    item.onclick = function(e) {

      // obtenenemos el texto
      var newText = e.target.innerHTML;

      // obtenemos la nueva posición
      var newCh = suggestions.from.ch + newText.length;

      // actualizamos el valor
      editor.replaceRange(newText, suggestions.from, suggestions.to);

      // Establcemos el focus en el editor
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

  // agrupamos cada uno de los elementos
  contentMainItems.appendChild(contentItems);
  contentScroll.appendChild(contentMainItems);
  contentSecondary.appendChild(contentScroll);
  contentSuggestions.appendChild(contentSecondary);
  document.body.appendChild(contentSuggestions);
}

function getOffset(element) {
  if (!element.getClientRects().length) {
    return { top: 0, left: 0 };
  }

  let rect = element.getBoundingClientRect();
  let win = element.ownerDocument.defaultView;
  return ({
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset
  });
}
/**
 * Metodo para obtener os datos necesario para mostrar el autocompletable
 */
GasTools.prototype.scriptHint = function(editor, keywordsList) {

  // obtenemos la información del cursor y de la linea donde este se encuentra
  var cur = editor.getCursor(),
    token = editor.getTokenAt(cur),
    tprop = token;

  // Se valida si existe un tipo y es un comentario o string para salir y no mostrar ningun autocompletable
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
  console.log('token', token);
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
   * Permite obtener las terminaciones, es decir las propiedades o metodos nativas de un tipo de elemento
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
    // Se usa el metodo de indexOf si la instancia de Array ya lo tiene definido
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

      // no se define nunguna vase
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

    // Se valida que realmente se tenga un objeto base y sea la busqueda del contexto como tal para tomar como base la ultima concurrencia
    while (base != null && context.length) {
      base = base[context.pop().string];
    }

    // si aun existe una base en envia para analizar cada uno de los items y agregarlos a la lista
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
 * Metodo crea el elemento para mostrar el error
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

    // valdiamos si es un warning
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

  // validmos si solo existe warnings
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
 * Metodo que permite mostrar los errores en el editor
 */
GasTools.prototype.showErrorIde = function(fileName) {
  console.log('fileName', fileName);

  // obtenemos la extensión del archivo
  var extension = fileName.replace(/^.*\./, '');
  console.log(extension);
  // validamos si la extensión es diferente de gs y html
  if (['gs', 'html'].indexOf(extension) == -1) return false;

  // obtenemos el valor del archivo
  var currValue = this.editor.getValue();

  // variable para recopilar ls errores
  var errors = [];

  // se valida si la extensión es 'GS'
  if (extension == 'gs') {

    // se procesa con la libreria de JsHint - https://thecodebarbarian.com/building-a-code-editor-with-codemirror.html
    JSHINT(currValue);

    // Se consulta la lista de errores
    errors = Array.isArray(JSHINT.errors) ? JSHINT.errors : [];
    console.log(errors);
  } else {

    // obtenemos los errores del archivo HTML
    errors = this.getValueByHtml(currValue);
  }

  // obtenemos el contenedor de los numeros de lineas
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
  console.log(script_line);

  // definimos la expresión regular que permite otener el contenido dentro de un script
  var regexp = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;

  // obtenemos la cantidad de etiquetas
  var scriptTags = valueHtml.match(regexp);

  // validamos si es null la cantdad de tags para salir de la función
  if (!scriptTags) return errors;

  // obtener todo el contenido de la etiqueta del script
  for (var i = 0; i < scriptTags.length; i++) {

    // Agregamos el contenido de cada script
    scriptContent.push(regexp.exec(scriptTags[0])[1]);
  }
  console.log(scriptContent);
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
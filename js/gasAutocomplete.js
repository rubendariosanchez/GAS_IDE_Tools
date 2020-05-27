/**
 * Creamos la clase de funciones personalizadas del editor, la trabajamos como protoripo para que funcione en todos las versiones de chrome
 */
function GasTools(instance) {

  // definimos una variable que determina que esa va a ser la principal de la clase
  // var _this = this;

  // referenciamos el editor de Google Apps Script
  this.editor = instance;

  // establecemos que el this de las siguientes funciones es el this de la clase
  this.autocomplete = this.autocomplete.bind(this);
  this.showErrorIde = this.showErrorIde.bind(this);
}

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

    // agregamos un evento al area de textos del editor
    this.editor.getInputField().addEventListener('keyup', function() {

      // ejecutamos la función de autocompletar
      _this.autocomplete();

      // se muestra el error cada vez que se escribe algo
      _this.showErrorIde(fileName);

    });
    //this.editor.setOption('mode', { name: 'javascript', 'globalVars': true });

    /*var map = {
      'Ctrl-Alt-A': function(cm) {
        // call to persistent search function here;
        console.log(cm)
        this.editor.execCommand("autocomplete");
        console.log('YOOOOO')
      }
    };
    this.editor.setOption('extraKeys', map);*/
  }

};

/**
 * Metodo para autocompletar texto de js
 */
GasTools.prototype.autocomplete = function(event) {

  // validamos si la instancia del editor existe
  if (this.editor) {

    /*testDOM(this.editor);

    var options = {
      hint: function() {
        return {
          from: this.editor.getCursor(),
          to: this.editor.getCursor(),
          list: ['foo', 'bar']
        }
      }
    };
    this.editor.showHint(options);*/

    // obtenemos la ubicación del cursor
    var cursorData = this.editor.getCursor();

    // obtenemos la información de la linea
    var lineData = this.editor.getLine(cursorData.line);
    //console.log(lineData);

  }

};

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
    new GasTools(el.CodeMirror).init();

    // agregamos la clase que determina que el lemento ya se inicializo
    el.classList.add('gas-tools-CodeMirror');
  });
}
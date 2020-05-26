/**
 * Creamos la clase de funciones personalizadas del editor, la trabajamos como protoripo para que funcione en todos las versiones de chrome
 */
function GasTools(instance) {

  // referenciamos el editor de Google Apps Script
  this.editor = instance;

  // definimos cual va a ser el this de la clase y no el elemnto DOM del evento
  this.autocomplete = this.autocomplete.bind(this);

}

/**
 * Metodo para inicializar la clase
 */
GasTools.prototype.init = function() {

  // validamos si la instancia del editor existe
  if (this.editor) {
    console.log(this.editor);
    // agregamos un evento al area de textos del editor
    this.editor.getInputField().addEventListener('keyup', this.autocomplete);
    //this.editor.setOption('gutters', ['error']);

    // Agregamos la función para agregar el autocompletado
    /*CodeMirror.registerHelper = function(cm, event){
      console.log(cm);
      console.log(event);
    }*/
  }

};

/**
 * Metodo crea el elemento para mostrar el error
 */
GasTools.prototype.makeMarkerError = function(gutterElement, line, reasonList) {

  // referenciamos el elemento donde se debe mostrar el error
  var element = gutterElement.querySelector('pre:nth-child(' + line + ')');

  // creamos el contenedor
  var markerError = document.createElement('span');
  markerError.classList.add('gas-error-marker');
  markerError.innerHTML = '&nbsp;';

  // creamos el contenedor del mensaje
  var errorMessage = document.createElement('div');
  errorMessage.classList.add('gas-error-message');
  markerError.appendChild(errorMessage);

  // creamos un ciclo para agregar las razones
  for (var i = 0; i < reasonList.length; i++) {

    // creamso el contenedor del error
    var divReason = document.createElement('div');
    divReason.innerHTML = reasonList[i];
    divReason.title = reasonList[i];
    errorMessage.appendChild(divReason);
  }

  // agregamos el marcador en la linea respectiva  
  element.appendChild(markerError);
}

/**
 * Metodo que permite mostrar los errores en el editor
 */
GasTools.prototype.showErrorIde = function(event) {
  // obtenemos el valor del archivo
  var currValue = this.editor.getValue();

  // se procesa con la libreria de JsHint - https://thecodebarbarian.com/building-a-code-editor-with-codemirror.html
  JSHINT(currValue);

  // Se consulta la lista de errores
  var errors = Array.isArray(JSHINT.errors) ? JSHINT.errors : [];
  console.log(errors)

  // obtenemos el contenedor de los numeros de lineas
  var gutterElement = this.editor.getGutterElement().querySelector('div.CodeMirror-gutter-text');

  // Eliminamos cada uno de los errores existentes
  this.clearErrors(gutterElement);

  // obtenemos la lista de errores agrupados
  var groupErrors = this.groupErrors(errors);
  console.log(groupErrors);

  // se recorre cada uno de los errores
  for (var line in groupErrors) {

    // mostramos el respectivo error
    this.makeMarkerError(gutterElement, line, groupErrors[line]);
  }

  // obtenemos la ubicación del cursor
  var cursorData = this.editor.getCursor();

  // obtenemos la información de la linea
  var lineData = this.editor.getLine(cursorData.line);
  console.log(lineData);

};

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
      errorObject[errors[i].line].push(errors[i].reason);

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

    // se remueve cada elemento
    el.remove();
  });
}

/**
 * Metodo para autocompletar texto de js
 */
GasTools.prototype.autocomplete = function(event) {

  // validamos si la instancia del editor existe
  if (this.editor) {

    // se muestra el error
    this.showErrorIde();

    // obtenemos la ubicación del cursor
    var cursorData = this.editor.getCursor();

    // obtenemos la información de la linea
    var lineData = this.editor.getLine(cursorData.line);
    console.log(lineData);

  }

};

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
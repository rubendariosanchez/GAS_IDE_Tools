"use strict";
// Google Apps Script se basa del proyecto "CodeMirror" : https://codemirror.net/
// Proyecto que nos puede ayudar - https://github.com/leonhartX/gas-github/blob/master/src
// iniciamos el aplicativo, después de agregar el contenido HTML
$(() => {

  // Agregamos los elementos en el editor
  initPageContent();
});

/**
 * Permite inicializar el contenido de la pagina
 */
function initPageContent(evt) {

  // establecemos un intervalos con el objetivo de verificar cuando el editor este cargado por completo
  var editorStateInterval = setInterval(checkLoadPage, 111);

  // definimos la variable que funcionará como opción de eliminar el ciclo si no fue posible obtener la instancia del editor
  var attempts = 0;

  /**
   * Permite chequear si la pagina fue cargada con éxito, antes de aplicar alguna cambio
   */
  function checkLoadPage() {

    // aumentamos la cantidad de intentos
    attempts++;

    // referenciamos el elemento del editor
    var editorElement = document.querySelector('.CodeMirror');

    // Validamos si el elemento del editor ya fue cargado o si ya supero la cantidad de intentos definidos  
    if (editorElement || attempts > 50) {

      // Eliminamos ciclo creado
      clearInterval(editorStateInterval);

      // se valida si fue exitoso obtener el elemento
      if (editorElement) {

        // Agregamos el contenido HTML para las funciones respectiva
        return Promise.all([
            $.get(chrome.runtime.getURL('html/options.html')),
            $.get(chrome.runtime.getURL('html/menu.html')),
            $.get(chrome.runtime.getURL('css/gasThemes.css')),
            $.get(chrome.runtime.getURL('css/gasHintValidate.css'))
          ])
          .then((content) => {

            // agregamos el campo de opciones de temas
            settingModuleTheme(content);

            // agregamos el script que administra las funciones personalizadas
            addScriptInPage('js/gasTools.js');

            // Agregamos el css para mostrar los detalles del error
            $('head').append(
              $("<style>").html(content[3])
            );

            // Agregamos el Javascript para validar js jshint
            $('head').append(
              $("<script>").attr('src', 'https://cdnjs.cloudflare.com/ajax/libs/jshint/2.11.0/jshint.js')
            );

          }).catch((e) => {

            // Mostramos en consola el error
            console.log(e)
          });

      } else {

        // Mostramos en consola un mensaje indicando que no fue posible inicializar las funciones personalizadas del IDE
        console.log('Lo sentimos pero no fue posible inicializar las funciones personalizadas del IDE.');
      }
    }
  }
}

/**
 * Permite agregar un archivo js en la pagina
 */
function addScriptInPage(fileName) {

  // Creamos un elemento de tipo script
  var scriptElement = document.createElement('script');

  // Agregar el archivo y no olvidar agregarlo en la sesión web_accessible_resources en el manifest.json
  scriptElement.src = chrome.runtime.getURL(fileName);

  // Validamos para que cuando se cargue el script se elimine el elemento creado temporalmente
  scriptElement.onload = function() {

    // Eliminamos el elemento
    this.remove();
  };

  // Agregamos el archivo en encabezado de la pagina y si no lo encuentra lo agrega al inicio del DOM
  (document.head || document.documentElement).appendChild(scriptElement);
}
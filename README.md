# Google Apps Script Custom IDE
[![Chrome Web Store](https://img.shields.io/badge/Google%20Apps%20Script-Custom%20IDE-blue)](https://github.com/rubendariosanchez/Google-Apps-Script-Custom-IDE)

Se trata de un proyecto que he iniciado con el objetivo de ir agregando funcionalidades al entorno de desarrollo (IDE) de Google Apps Script. En su primera versión se crea como extensión para Google Chrome y se comparte el código en búsqueda de recibir realimentación de otros desarrolladores y así mismo ir mejorando lo constantemente.


[![Google Apps Script Custom IDE](https://lh3.googleusercontent.com/-R0iiRiUVyMw/Xtq1N_DBezI/AAAAAAAAJSk/w7e7wkOR4xwtvmy8Y592m0TM-ue48VOHACK8BGAsYHg/s0/secondPhoto.png)](https://github.com/rubendariosanchez/Google-Apps-Script-Custom-IDE)


Las características que posee actualmente la extensión son las siguientes:

| # | Característica | Descripción |
| - | - | - |
| 1 | Temas | Lista de aproximadamente 63 temas para aplicar en el editor de Google Apps Script. |
| 2 | Iconos | Se agrega iconos personalizados para identificar más fácilmente que tipo de archivo es. |
| 3 | Verificar errores | Haciendo uso de la librería [JHINT](https://jshint.com/) se agrega la funcionalidad de validar la sintaxis del código Javascript y Google Apps Script. Inicialmente se deseaba colocar la información del error o warning en la misma línea sin embargo el editor ya tiene una funcionalidad de agregar un punto de interrupción para la depuración del código. |
| 4 | Ocultar y mostrar bloques | Para los que nos gusta ocultar bloques de código con el objetivo de navegar más fácil dentro de un archivo extenso, por lo anterior se agregó la posibilidad de mostrar y ocultar bloques de código mediante la combinación de teclas: Alt + Q. |
| 5 | Autocompletado de Javascript | Por último se agrega la funcionalidad de autompletado de código Javascript, esta funcionalidad esta disponible solo en los archivos con extensión **.html**. En proximas versiones permitira autocompletar código javascript incluyendo metodos y Jquery. **NOTA:** para mostrar sugerencia solo debe oprimir la combinación de teclas **Ctrl** + **Space**|

### Instalación


Desde el navegador de Google Chrome acceder al [Chrome Web Store](https://chrome.google.com/webstore/detail/google-apps-script-custom/iopfooincihblbhjfhogkejlpmmabmcn) y realizar la instalación de la extensión.


### Agradecimientos


- Los temas agregados al editor se modificaron un poco y fueron tomados de la página [CodeMirror](https://codemirror.net/demo/theme.html), donde agradezco a sus creadores.
- La funcionalidad para autompletado de código Javascript se base del complemento que encontramos en [CodeMirror/2/autocomplete](https://codemirror.net/2/demo/complete.html).


Licencia
----


[MIT](https://opensource.org/licenses/MIT)




**El código es libre y puede ser usado en nuevas iniciativas o como apoyo a este proyecto.**
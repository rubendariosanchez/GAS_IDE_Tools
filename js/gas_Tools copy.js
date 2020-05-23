$('body').on('keyup', verifyElements);

/**
 * Permite validar si debe analizar la información y mostrar el autocomplete
 */
function verifyElements(event) {
  var editor = document.querySelector('.CodeMirror').CodeMirror;
  console.log("editor", editor)
  document.querySelector('.CodeMirror').CodeMirror.execCommand('indentAuto')
    // Se valida si no existe la instancia del editor
  if (!G_EDITOR) {

    // variable para manejar la instancia del editor
    G_EDITOR = $('.CodeMirror').CodeMirror;

    //Select editor loaded in the DOM
    var myEditor = $(".CodeMirror");
    console.log(myEditor);
    console.log(myEditor[0].CodeMirror);
  }
  console.log(event)
    // se referencia el elemento dode se agrego algun caracter
  var $element = $(event.target);
  console.log($element.val())
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
    console.log('Linea actual: ', currentLine);
    console.log($lineEdit.html())
    console.log($cursor);
    console.log($parent)
    console.log(document.querySelector('.CodeMirror'))
  }

}
class GasTools {

  /**
   * Creamos el contructosr con las propiedades generales
   */
  constructor(editorInstance) {
    
    // referenciamos el editor
    this.editor = editorInstance;
  }
  
  /*
  * Permite inicializar la clas que contendra funcionalidades en el IDE
  */
  init(){

    // validamos si la instancia del editor existe
    if(this.editor){

      // agregamos un evento al area de textos del editor
      this.editor.getInputField().addEventListener('keyup', this.autocomplete);
    }

  }
  autocomplete() {
    console.log(this.editor)
    console.log(this.editor.getValue());
  }

}
/**
 * Agregamos un evento para que cuando cargue el aplicativo se inicialice la clase de heramientas del IDE
 */
window.addEventListener ("load", initGasTools, false);

/**
 * Permite inicializar la clase de funciones personalizas
 */
function initGasTools (evt) {

  // establecemos un intervalos con el objetivo de verificar cuando el editor este cargado por completo
  var editorStateInterval = setInterval (checkEditorState, 111);

  // definimos la variable que funcionará como opción de eliminar el ciclo si no fue posible obtener la instancia del editor
  var attempts = 0;

  /**
  * Permite checkear si el editor ya fue cargado para inicializar la clase personalida
  */
  function checkEditorState () {
    
    // aumentamos la cantidad de intentos
    attempts ++;
    
    // referenciamos el elemneto del editor
    var editorElement = document.querySelector('.CodeMirror');

    // Validamos si el elemento del editor ya fue cargado o si ya supero la cantidad de intentos definidos  
    if (editorElement || attempts > 50) {
        
      // Eliminamos ciclo creado
      clearInterval (editorStateInterval);

      // se valida si fue existoso obtener el elemento
      if(editorElement){

        // Inicializamos las funciones personalizadas
        new GasTools(editorElement.CodeMirror).init(); 
        //(?:\w+.\w+$)

      } else {

        // Mostramos en consola un mensaje indicando que no fue posible inicializar las funciones personalizadas del IDE
        console.log('Lo sentimos pero no fue posible inicializar las funciones personalizadas del IDE.');
      }
    }
  }
}
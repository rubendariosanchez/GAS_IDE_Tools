/** 
 * Creamos la clase para manejar una ventana en la que podra visualizar la lista de errores
 */
function PopoverGas(trigger, errorList) {

  // referenciamos la opción donde se da clic y la variable para almacenar el elemento
  this.trigger = trigger;
  this.element = null;

  // variable que controla la apertura del elemento a mostrar
  this._isOpen = false;

  // Agregamos la lista de errores
  this.errorList = errorList;

  // llamamos el metodo para agregar el evento
  this.addEvent();
}

/**
 * Método para mostrar u ocultar la ventana
 */
PopoverGas.prototype.toggle = function(e) {
  // Se detiene la propagación de algun otro evento
  e.stopPropagation();

  // se valida si ya esta abierta la ventana
  if (this._isOpen && document.querySelector('.popover-gas')) {

    // Se cierra la ventana
    this.close(e);
  } else {

    // se garantiza que no exista ningun panel abiertp
    document.querySelectorAll('.popover-open').forEach(function(element) {
      element.click();
    });

    // agregamos la clase de apertura
    this.trigger.classList.add('popover-open');

    // se procede a crear el contenedor
    this.createPopover();

    // se cambia el estado a que ya es abierta la ventana
    this._isOpen = true;

    // se establece el evento que permite hacer clic por fuera y cerrar l aventana
    this.outsideClick();

    // lo posiciona en el lugar indicado
    this.position();
  }
};


/**
 * Método para mostrar u ocultar la ventana
 */
PopoverGas.prototype.addEvent = function() {

  // Se establece el evento al elemento
  this.trigger.addEventListener('click', this.toggle.bind(this));
}

/**
 * Método que establcer el evento cuando se hace click por fuera de la ventana
 */
PopoverGas.prototype.outsideClick = function(e) {

  // se establece el evento al body para permitir cerrar la ventana cuando se realice clic por fuera
  document.addEventListener('click', this.close.bind(this));

};

/**
 * Método que establecer el evento cuando se hace click por fuera de la ventana
 */
PopoverGas.prototype.outsideClick = function(e) {

  // se establece el evento al body para permitir cerrar la ventana cuando se realice clic por fuera
  document.addEventListener('click', this.close.bind(this));

};

/**
 * Método que permite cerrar la ventana
 */
PopoverGas.prototype.close = function(e) {

  // Se valida si no se esta realizando clic dentro del elemento
  if (!this.targetIsInsideElement(e) && this.element) {

    // se remueve el elemento
    this.element.remove();

    // se remueve el elemento
    this.element = null;

    // cambiamos el estado
    this._isOpen = false;

    // removemos la clase 'popover-open'
    this.trigger.classList.remove('popover-open');

    // Eliminamos el evento del body
    this.killOutSideClick();
  }

};

/**
 * Método que permite eliminar el evento de la pagina
 */
PopoverGas.prototype.killOutSideClick = function(e) {

  // Se valida si no se esta realizando clic dentro del elemento
  document.removeEventListener('click', this.close.bind(this));

};

/**
 * Método que permite validar si se esta realizando clic dentro de la ventana
 */
PopoverGas.prototype.targetIsInsideElement = function(e) {

  // Se referencia el elemento
  var target = e.target;

  // se valida que exista o que sea valido
  if (target && this.element) {
    do {

      // Se valida que el elemento pertenezca al popover
      if (this.element && target === this.element) {
        // se retorna verdadero
        return true;
      }
    } while (target = target.parentNode);
  }

  // por defecto se retorna falso
  return false;

};

/**
 * Método que permite establcer la posición de la ventana
 */
PopoverGas.prototype.position = function(e) {

  // se valida que el elemento exista
  if (this.element) {

    // Se obtiene los datos de la posición de cada elemento
    var triggerRect = this.trigger.getBoundingClientRect(),
      elementRect = this.element.getBoundingClientRect();

    //this.element.style.left = Number(triggerRect.left) + Number((triggerRect.width / 2) - Number(elementRect.width / 2)) + 'px';
    this.element.style.left = (Number(triggerRect.left) - 8) + 'px';
    this.element.style.top = (Number(triggerRect.bottom) + 7) + 'px';
  }
};

/**
 * Método que permite crear la ventana
 */
PopoverGas.prototype.createPopover = function(e) {

  // creamos el elemento
  this.element = document.createElement('div');

  // agregamos las clases respectivas
  this.element.className = 'popover-gas popover-gas-bottom';

  // agregamos el elemento al cuerpo de la página
  document.body.appendChild(this.element);

  // creamos el elemento de la flecha
  var arrowElement = document.createElement('div');
  arrowElement.classList.add('popover-gas__arrow');
  this.element.appendChild(arrowElement);

  // creamos el elemento del títulos
  var titleElement = document.createElement('div');
  titleElement.classList.add('popover-gas__title');
  titleElement.innerHTML = 'Lista de errores';
  this.element.appendChild(titleElement);

  // creamos el elemento del contenedor
  var contentElement = document.createElement('div');
  contentElement.classList.add('popover-gas__content');
  this.element.appendChild(contentElement);

  // creamos el contenido
  this.addErrorContent(contentElement);
};

/**
 * Método que permite agregar la lista de errores
 */
PopoverGas.prototype.addErrorContent = function(contentElement) {

  // creamos la tabla
  var table = document.createElement('table');
  table.classList.add('table-custom');
  contentElement.appendChild(table);

  // creamos el encabezado
  var header = document.createElement('thead');
  header.innerHTML = '<tr><th>Línea</th><th>Descripción del error</th></tr>';
  table.appendChild(header);

  // creamos el encabezado
  var body = document.createElement('tbody');
  table.appendChild(body);

  // se recorre cada uno de los errores
  for (var line in this.errorList) {

    // mostramos el respectivo error
    this.addRowInTable(line, this.errorList[line], body);
  }
};

/**
 * Método que permite crear una nueva fila
 */
PopoverGas.prototype.addRowInTable = function(line, reasonList, body) {

  // creamos la fila
  var row = document.createElement('tr');
  body.appendChild(row);

  // creamos la primera columna
  var columnOne = document.createElement('td');
  columnOne.innerHTML = line;
  row.appendChild(columnOne);

  // creamos la primera columna
  var columnTwo = document.createElement('td');
  row.appendChild(columnTwo);

  // creamos un ciclo para agregar las razones
  for (var i = 0; i < reasonList.length; i++) {

    // creamso el contenedor del error
    var divReason = document.createElement('div');
    divReason.innerHTML = reasonList[i].reason;
    columnTwo.appendChild(divReason);

    // validamos si es un warning
    if (reasonList[i].severity == 'warning') {

      // agregamos la clase al elemento para mostrar icono
      divReason.classList.add('gas-warning-item');
    } else {

      // agregamos la clase al elemento para mostrar icono
      divReason.classList.add('gas-error-item');
    }
  }

};
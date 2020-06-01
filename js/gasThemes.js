/**
 * Permite definir los eventos del módulo de temas
 */
function settingModuleTheme(contentHtml) {

  // agregamos el campo de opciones de temas
  $('#functionSelect').after(contentHtml[0]);

  // Agregamos la opción del menu en el menu
  $('body').children().last().after(contentHtml[1]);

  // Agregamos el css de temas 
  $('head').append(
    $("<style>").html(contentHtml[2])
  );

  // definimos el texto que deseamos ajustar para que se muestre correctamente el cursor en el editor
  var classCursor = escapeRegExp('.CodeMirror-cursor{z-index:10;position:absolute;visibility:hidden;border-left:1px solid black!important}');

  // buscamos en el encabezado las etiquetas style el objetivo de eliminar el atributo important usado en el cursor del editor
  $('head').find('style').each(function() {

    //obtenemos el elemento actual
    var $currentStyle = $(this);

    // obtenemos el valor
    var styleValue = $currentStyle.html();

    // reemplazamos
    styleValue = styleValue.replace(new RegExp(classCursor), '.CodeMirror-cursor{z-index:10;position:absolute;visibility:hidden;border-left:1px solid black;}');

    // actualizamos los estilos
    $currentStyle.html(styleValue);
  });

  // Establecemos el efecto de hover al botón de tema
  $('#sltGasTheme').hover(function() {

    // agregamos la clase que muestra el hover
    $('#sltGasTheme').addClass('goog-toolbar-menu-button-hover');
  }, function() {

    // Eliminamos la clase que muestra el hover
    $('#sltGasTheme').removeClass('goog-toolbar-menu-button-hover');
  });

  // Agregamos la lista de temas
  addThemeList();

  // Agregamos los eventos respectivos
  eventsModuleTheme();

  // Consultamos las propiedades de la cuenta de usuario para agregar la clase respectiva
  updateThemeIdeGas(false, 1);

  // Agregamos el vínculo del código fuente
  $('.status-bar').append(
    $('<div>').attr({class: 'person-link'}).append(
      $('<a>').attr({href: 'https://github.com/rubendariosanchez/', target: '_blank'}).text('@RubénS.')
    )
  );
}

/**
 * Permite agregar caracteres de escape para que la expresión regular función sin problemas
 */
function escapeRegExp(string) {

  //$& significa toda la cadena combinada
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * Establecemos el tema por defecto o el guardado por el usuario
 */
function setThemeIdeGas(newTheme, themeName, isSave) {

  // validamos si no existe el valor
  newTheme = newTheme || 'cm-s-default';
  themeName = themeName || 'Default';

  // Eliminamos la clase por defecto del editor
  $('.CodeMirror-scroll').attr({ class: 'CodeMirror-scroll cm-s-default CodeMirror-focused' });

  // Agregamos la clase personalizada
  $('.gwt-TabLayoutPanel.editor').attr({ class: 'gwt-TabLayoutPanel editor ' + newTheme });

  // Validamos si se debe guardar la clase
  if (isSave) {

    // Guardamos la clase seleccionada
    chrome.storage.sync.set({
      'gasToolsProperties': {
        'classSelected': newTheme,
        'themeName': themeName
      }
    });

  }

  // Agregamos el nombre de la clase seleccionada
  $('#gasThemeName').html('Tema seleccionado: <span style="color: #4285f4;">' + themeName + '</span>');

  // Ocultamos el select
  $('#sltGasTheme').removeClass('goog-toolbar-menu-button-open');

  // ocultamos el panel de opciones
  $('.gas-themes-menu').hide();
}

/**
 * Permite definir los eventos del módulo de temas
 */
function eventsModuleTheme() {

  //Ayuda para que cuando se realice clic por fuera de la lista se oculte la misma
  $(document).mouseup(function(event) {
    var $container = $('.gas-themes-menu');
    var $button = $('#sltGasTheme');
    if (!$container.is(event.target) &&
      !$button.is(event.target) &&
      $container.has(event.target).length === 0 &&
      $button.has(event.target).length == 0) {
      $container.hide();
      $button.removeClass('goog-toolbar-menu-button-open');
    }
  });

  // Agregamos el evento para mostrar la lista de temas
  $(document).on('click', '#sltGasTheme', function(event) {

    // validamos si existe algún item para mostrar
    if ($('.gas-themes-menu div.goog-menuitem').length > 0) {

      // Agregamos la clase de apertura de una lista
      $('#sltGasTheme').toggleClass('goog-toolbar-menu-button-open');

      // Mostramos u ocultamos la lista de valores
      $('.gas-themes-menu').css('left', $('#sltGasTheme').position().left + 55).toggle();
    }
  });

  // Adicionamos el evento para que agregue la clase de hover al elemento
  $(document).on('mouseover', '.gas-custom-item', function(event) {

    // referenciamos el elemento como tipo Jquery
    var target = $(event.target);

    // se valida si el elemento NO es un item
    if (!target.hasClass('gas-custom-item')) {

      // consultamos el padre con la clse de item
      target = target.parent('.gas-custom-item');
    }

    // agregamos la clase usada por Google para resaltar un ítem
    target.addClass('goog-menuitem-highlight');
  });

  // Adicionamos el evento para remover la clase de hover al elemento
  $(document).on('mouseleave', '.gas-custom-item', function(event) {

    // referenciamos el elemento como tipo Jquery
    var target = $(event.target);

    // se valida si el elemento NO es un item
    if (!target.hasClass('gas-custom-item')) {

      // consultamos el padre con la clase de item
      target = target.parent('.gas-custom-item');
    }

    // Removemos la clase usada por Google para resaltar un ítem
    target.removeClass('goog-menuitem-highlight');
  });
}

/**
 * Permite actualizar la clase al editor
 */
function updateThemeIdeGas(event, notInterval) {

  // Consultamos las propiedades de la cuenta de usuario
  chrome.storage.sync.get(['gasToolsProperties'], function(item) {

    // validamos si existe la propiedad y existe clase
    if (item && item.gasToolsProperties && item.gasToolsProperties.classSelected) {

      // establecemos la clase almacenada
      setThemeIdeGas(item.gasToolsProperties.classSelected, item.gasToolsProperties.themeName);
    } else {

      // Establecemos la clase por defecto
      setThemeIdeGas('cm-s-default', 'Defecto');
    }

  });

}

/**
 * Permite agregar una clase al editor
 */
function changeThemeIdeGas() {

  // refernciamos el elemento donde se da clic
  var $element = $(this);

  // obtenemos la clase a mostrar
  var newClassName = $element.attr('data-class');

  // Obtenemos el texto del nombre del tema
  var themeName = $element.find('div.goog-menuitem-content').text();

  // Agregamos el tema
  setThemeIdeGas(newClassName, themeName, true);
}

/**
 * Permite agregar la lista de temas
 */
function addThemeList() {

  // se define la lista de temas
  var themesList = [
    { name: 'Default', class: 'cm-s-default' },
    { name: '3024-day', class: 'cm-s-3024-day' },
    { name: '3024-night', class: 'cm-s-3024-night' },
    { name: 'Abcdef', class: 'cm-s-abcdef' },
    { name: 'Ambiance', class: 'cm-s-ambiance' },
    { name: 'Ayu-dark', class: 'cm-s-ayu-dark' },
    { name: 'Ayu-mirage', class: 'cm-s-ayu-mirage' },
    { name: 'Base16-dark', class: 'cm-s-base16-dark' },
    { name: 'Base16-light', class: 'cm-s-base16-light' },
    { name: 'Bespin', class: 'cm-s-bespin' },
    { name: 'Blackboard', class: 'cm-s-blackboard' },
    { name: 'Cobalt', class: 'cm-s-cobalt' },
    { name: 'Colorforth', class: 'cm-s-colorforth' },
    { name: 'Darcula', class: 'cm-s-darcula' },
    { name: 'Dracula', class: 'cm-s-dracula' },
    { name: 'Duotone-dark', class: 'cm-s-duotone-dark' },
    { name: 'Duotone-light', class: 'cm-s-duotone-light' },
    { name: 'Eclipse', class: 'cm-s-eclipse' },
    { name: 'Elegant', class: 'cm-s-elegant' },
    { name: 'Erlang-dark', class: 'cm-s-erlang-dark' },
    { name: 'Gruvbox-dark', class: 'cm-s-gruvbox-dark' },
    { name: 'Hopscotch', class: 'cm-s-hopscotch' },
    { name: 'Icecoder', class: 'cm-s-icecoder' },
    { name: 'Idea', class: 'cm-s-idea' },
    { name: 'Isotope', class: 'cm-s-isotope' },
    { name: 'Lesser-dark', class: 'cm-s-lesser-dark' },
    { name: 'Liquibyte', class: 'cm-s-liquibyte' },
    { name: 'Lucario', class: 'cm-s-lucario' },
    { name: 'Material', class: 'cm-s-material' },
    { name: 'Material-darker', class: 'cm-s-material-darker' },
    { name: 'Material-palenight', class: 'cm-s-material-palenight' },
    { name: 'Material-ocean', class: 'cm-s-material-ocean' },
    { name: 'Mbo', class: 'cm-s-mbo' },
    { name: 'Mdn-like', class: 'cm-s-mdn-like' },
    { name: 'Midnight', class: 'cm-s-midnight' },
    { name: 'Monokai', class: 'cm-s-monokai' },
    { name: 'Moxer', class: 'cm-s-moxer' },
    { name: 'Neat', class: 'cm-s-neat' },
    { name: 'Neo', class: 'cm-s-neo' },
    { name: 'Night', class: 'cm-s-night' },
    { name: 'Nord', class: 'cm-s-nord' },
    { name: 'Oceanic-next', class: 'cm-s-oceanic-next' },
    { name: 'Panda-syntax', class: 'cm-s-panda-syntax' },
    { name: 'Paraiso-dark', class: 'cm-s-paraiso-dark' },
    { name: 'Paraiso-light', class: 'cm-s-paraiso-light' },
    { name: 'Pastel-on-dark', class: 'cm-s-pastel-on-dark' },
    { name: 'Railscasts', class: 'cm-s-railscasts' },
    { name: 'Rubyblue', class: 'cm-s-rubyblue' },
    { name: 'Seti', class: 'cm-s-seti' },
    { name: 'Shadowfox', class: 'cm-s-shadowfox' },
    { name: 'Solarized dark', class: 'cm-s-solarized cm-s-dark' },
    { name: 'Solarized light', class: 'cm-s-solarized cm-s-light' },
    { name: 'Ssms', class: 'cm-s-ssms' },
    { name: 'The-matrix', class: 'cm-s-the-matrix' },
    { name: 'Tomorrow-night-bright', class: 'cm-s-tomorrow-night-bright' },
    { name: 'Tomorrow-night-eighties', class: 'cm-s-tomorrow-night-eighties' },
    { name: 'Ttcn', class: 'cm-s-ttcn' },
    { name: 'Twilight', class: 'cm-s-twilight' },
    { name: 'Vibrant-ink', class: 'cm-s-vibrant-ink' },
    { name: 'Xq-dark', class: 'cm-s-xq-dark' },
    { name: 'Xq-light', class: 'cm-s-xq-light' },
    { name: 'Yeti', class: 'cm-s-yeti' },
    { name: 'Yonce', class: 'cm-s-yonce' },
    { name: 'Zenburn', class: 'cm-s-shadowfox' }
  ];

  // referenciamos el contenedor
  var $content = $('.gas-themes-menu');

  // recorremos cada uno de los items de la lista
  for (var i = 0; i < themesList.length; i++) {

    // agregamos cada una de las opciones
    $content.append(
      $('<div>').attr({ class: 'gas-custom-item goog-menuitem', 'data-class': themesList[i].class }).append(
        $('<div>').attr({ class: 'goog-menuitem-content' }).text(themesList[i].name)
      ).click(changeThemeIdeGas)
    );
  }
}
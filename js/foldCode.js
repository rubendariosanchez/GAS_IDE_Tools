//  Basada en la líbreria proporcionad por Copyright (C) 2011 by Daniel Glazman <daniel@glazman.org> para CodeMirro v2
// released under the MIT license (../../LICENSE) like the rest of CodeMirror

// Permite agregar un metodo al editor el cual permite verificar la apertura de una función o de un objeto teniedno como base la apertura o cierre de una llave
CodeMirror.braceRangeFinder = function(cm, line, hideEnd) {

  var lineText = cm.getLine(line),
    at = lineText.length,
    startChar, tokenType;
  for (;;) {
    var found = lineText.lastIndexOf("{", at);
    if (found < 0) break;
    tokenType = cm.getTokenAt({ line: line, ch: found }).className;
    if (!/^(comment|string)/.test(tokenType)) { startChar = found; break; }
    at = found - 1;
  }
  if (startChar == null || lineText.lastIndexOf("}") > startChar) return;
  var count = 1,
    lastLine = cm.lineCount(),
    end;
  outer: for (var i = line + 1; i < lastLine; ++i) {
    var text = cm.getLine(i),
      pos = 0;
    for (;;) {
      var nextOpen = text.indexOf("{", pos),
        nextClose = text.indexOf("}", pos);
      if (nextOpen < 0) nextOpen = text.length;
      if (nextClose < 0) nextClose = text.length;
      pos = Math.min(nextOpen, nextClose);
      if (pos == text.length) break;
      if (cm.getTokenAt({ line: i, ch: pos + 1 }).className == tokenType) {
        if (pos == nextOpen) ++count;
        else if (!--count) { end = i; break outer; }
      }
      ++pos;
    }
  }
  if (end == null || end == line + 1) return;
  if (hideEnd === true) end++;
  return end;
};

/**
 * Se establece una nueva función para el manejo de mostrar u ocultar filas de un bloque de código JS
 */
CodeMirror.newFoldFunction = function(rangeFinder, markText, hideEnd) {

  // Variable en la que se guardar la lista de rango ocultos
  var folded = [];

  /**
   * Función que permite validar si se debe ocultar o mostrar
   */
  function isFolded(cm, n) {
    for (var i = 0; i < folded.length; ++i) {
      var start = cm.lineInfo(folded[i].start);
      if (!start) folded.splice(i--, 1);
      else if (start.line == n) return { pos: i, region: folded[i] };
    }
  }

  /**
   * Función que permite expandir o mostrar filas
   */
  function expand(cm, region) {

    // Se recorre cada una de las filas ocultas 
    for (var i = 0; i < region.hidden.length; ++i) {

      // Se muestra la fila respectiva
      cm.showLine(region.hidden[i]);
    }
  }

  /**
   * Metodo para realizar la acción
   */
  return function(cm, line) {

    // Se realiza una operación 
    cm.operation(function() {

      // Se valida si ya esta oculto el bloque
      var known = isFolded(cm, line);

      // se valida si el bloque ya esta oculto
      if (known) {

        // Elimina una posibción de los bloques ocultos
        folded.splice(known.pos, 1);

        // se elimina la clase respectiva
        cm.setLineClass(line, '');

        // Se muestra las filas asociadas al bloque
        expand(cm, known.region);
      } else {

        // se obtiene el rango de linea a ocultar
        var end = rangeFinder(cm, line, hideEnd);

        // Se sale del ciclo porque no tiene que hacer nada
        if (end == null) return;

        // Se define la variable para listar las lineas a ocultar
        var hidden = [];

        // Se recorre cada una de las líneas de los bloques
        for (var i = line + 1; i < end; ++i) {

          // se oculta la linea
          var handle = cm.hideLine(i);

          // Se valida si efectivamente se oculto la fila
          if (handle) hidden.push(handle);
        }

        // Establcemos la linea base donde se esconde el bloque
        var first = cm.getLineHandle(line);

        // Se establece que indica que se oculto lineas
        cm.setLineClass(line, 'line-selected');

        // se define la region al
        var region = { start: first, hidden: hidden };

        // Agregamos la región oculta
        folded.push(region);
      }
    });
  };
};
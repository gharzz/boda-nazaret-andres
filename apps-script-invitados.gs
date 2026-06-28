/**
 * Boda · Generador de lista de invitados (1 fila por persona)
 * --------------------------------------------------------------
 * Lee las respuestas del formulario (donde adultos y niños llegan
 * concatenados en una celda) y genera una pestaña "Invitados" con
 * una fila por persona y columnas limpias, lista para exportar a CSV.
 *
 * Si renombraste columnas en el Google Form, añade el nuevo nombre
 * a las listas CANDIDATAS_* de abajo (no hace falta borrar las viejas).
 */

var CANDIDATAS_ADULTOS = ['Adultos: nombres y alergias', 'Nombre(s) del acompañante'];
var CANDIDATAS_NINOS   = ['Niños: nombres y alergias', 'Alergias o intolerancias'];
var CANDIDATAS_ASISTE  = ['¿Asistirás?'];
var CANDIDATAS_NOMBRE  = ['Nombre y Apellidos', 'Nombre y apellidos'];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Boda 💍')
    .addItem('Generar lista de invitados', 'generarInvitados')
    .addToUi();
}

function generarInvitados() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var resp = getRespSheet(ss);
  var data = resp.getDataRange().getValues();
  var ui = SpreadsheetApp.getUi();

  if (data.length < 2) { ui.alert('Todavía no hay respuestas.'); return; }

  var header = data[0];
  var idxAsiste  = buscarCol(header, CANDIDATAS_ASISTE);
  var idxNombre  = buscarCol(header, CANDIDATAS_NOMBRE);
  var idxAdultos = buscarCol(header, CANDIDATAS_ADULTOS);
  var idxNinos   = buscarCol(header, CANDIDATAS_NINOS);

  if (idxAdultos < 0 && idxNinos < 0) {
    ui.alert('No encuentro las columnas de adultos/niños. Abre Apps Script y añade el nombre exacto de esas columnas a CANDIDATAS_ADULTOS / CANDIDATAS_NINOS.');
    return;
  }

  var filas = [['Marca temporal', '¿Asiste?', 'Tipo', 'Nombre', 'Alergias']];

  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var ts = row[0]; // la marca temporal siempre es la 1ª columna
    var asiste = String(idxAsiste >= 0 ? row[idxAsiste] : '').trim();

    if (asiste === 'No') {
      filas.push([ts, 'No', 'No asiste', String(idxNombre >= 0 ? row[idxNombre] : '').trim(), '']);
      continue;
    }

    var personas = parsePersonas(idxAdultos >= 0 ? row[idxAdultos] : '', 'Adulto')
            .concat(parsePersonas(idxNinos >= 0 ? row[idxNinos] : '', 'Niño'));

    if (personas.length === 0) {
      filas.push([ts, 'Sí', 'Adulto', String(idxNombre >= 0 ? row[idxNombre] : '').trim(), '']);
    } else {
      for (var p = 0; p < personas.length; p++) {
        filas.push([ts, 'Sí', personas[p].tipo, personas[p].nombre, personas[p].alergias]);
      }
    }
  }

  var hoja = ss.getSheetByName('Invitados') || ss.insertSheet('Invitados');
  hoja.clearContents();
  hoja.getRange(1, 1, filas.length, 5).setValues(filas);
  hoja.getRange(1, 1, 1, 5).setFontWeight('bold');
  hoja.setFrozenRows(1);
  ss.setActiveSheet(hoja);
  ui.alert('Lista generada: ' + (filas.length - 1) + ' personas en la pestaña "Invitados".\n\nPara el CSV: Archivo → Descargar → CSV (descarga la pestaña activa).');
}

function getRespSheet(ss) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (/respuestas|form responses/i.test(sheets[i].getName())) return sheets[i];
  }
  return sheets[0];
}

function buscarCol(header, candidatas) {
  for (var c = 0; c < candidatas.length; c++) {
    for (var i = 0; i < header.length; i++) {
      if (String(header[i]).trim() === candidatas[c]) return i;
    }
  }
  return -1;
}

/** Convierte "1. Juan — Alergias: lactosa  |  2. Ana — Sin alergias" en [{tipo,nombre,alergias}, ...] */
function parsePersonas(texto, tipo) {
  texto = String(texto || '').trim();
  if (!texto) return [];
  var trozos = texto.split(/\s*\|\s*/);
  var out = [];
  for (var i = 0; i < trozos.length; i++) {
    var t = trozos[i].replace(/^\s*\d+\.\s*/, '').trim();
    if (!t) continue;
    var nombre = t, alergias = 'Ninguna';
    var m = t.match(/^(.*?)\s+—\s+(?:Alergias:\s*(.*)|Sin alergias)\s*$/);
    if (m) {
      nombre = m[1].trim();
      alergias = (m[2] && m[2].trim()) ? m[2].trim() : 'Ninguna';
    }
    out.push({ tipo: tipo, nombre: nombre, alergias: alergias });
  }
  return out;
}

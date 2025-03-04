import "phoenix_html";
import "./flash.js";
import "./server_talk.js";
import "./ui.js";
import "./state.js";
import "./tag.js";
import "./time_calculs.js";
import "./preferences.js";
import "./filter.js";
import "./color.js";
import "./form_element.js";
import "./mouse_click.js";
import "./tension_line.js";

import "./STT/_MetaSTT.js";
import "./STT/_MetaSTTElement.js";
import "./STT/HorizontalSTT.js";
import "./STT/HorizontalSTTElement.js";
import "./STT/VerticalSTT.js";
import "./STT/VerticalSTTElement.js";
import "./STT/EditingSTT.js";
import "./STT/EditingSTTElement.js";

window.FULL = 'FULL'

// Pour lever une erreur juste avec 'raise("message")'
window.raise = function(message, errField){
  if ( errField ) {
    errField.classList.add('error')
    errField.focus()
    errField.select()
  }
  throw new Error(message)
}

window.NullIfEmpty = function(value){
  if ( value === null || value === undefined ) return null ;
  return value.trim() === "" ? null : value ;
}

window.isNullish = function(v){
  return v === null || v === undefined ;
}

window.onload = function(ev){
  UI.init()
}

UI.ctest = function(){
	if (!this.active) {
		this.active = true
    return active_lib_testor(UI)
	}
  /* === DÉBUT DES TESTS === */

  t("--- FormElement ---")
  t("- Calculs sur horloges")
  const Fo = FormElement;
  [
      ["0:00", "0:00"]
    , ["0,00", "0:00"]
    , ["0,00,00", "0:00:00"]
    , ["0:12:00", "0:12:00"]
    , ["0,12,00", "0:12:00"]
    , ["12,00", "12:00"]
    , ["0:0+ 1", "0:01"]
    , ["0,0+ 1", "0:01"]
    , ["0:00+10", "0:10"]
    , ["0:0 +60", "1:00"]
    , ["0:00 + 3600", "1:00:00"]
    , ["0:12 + 3600", "1:00:12"]
    , ["0:12:0 + 3600", "1:12:00"]
    , ["0:12:0 + 4m", "0:16:00"]
    , ["0:12:0 + 4:0", "0:16:00"]
    , ["0:12:0 + 4s", "0:12:04"]
    , ["1:12:0 + 0:4", "1:12:04"]
    , ["0:12:0 + 0,4", "0:12:04"]
    , ["0:12:0 + 4h", "4:12:00"]
    , ["1:12:0 + 4,0,0", "5:12:00"]
    , ["0:12:0 + 4:0:0", "4:12:00"]
    , ["1:12:0 + 4 * 3600 + 3", "5:12:03"]
    , ["0:0 + 5m 3s4h ", "4:05:03"]
    , ["12", "0:12"]
    , ["12m", "12:00"]
    , ["60*12", "12:00"]
    , ["0,12 - 12", "0:00"]
    , ["0,12 - 12", "0:00"]
    , ["0,12 - 0:12", "0:00"]
    , ["0,12 - 12s", "0:00"]
    , ["0,4,12 - 12s 2m", "0:02:00"]
    , ["0:01:00 - 12", "0:00:48"]
  ].forEach(paire => {
    const [sujet, expected] = paire;
    const actual = TimeCalc.treate(sujet, false)
    equal(actual, expected)
  })

  t("--- Création d'élément ---")


}
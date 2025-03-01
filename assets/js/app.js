import "phoenix_html";
import "./flash.js";
import "./server_talk.js";
import "./time_calculs.js";
import "./preferences.js";
import "./structure.js";
import "./ui.js";
import "./stt_element.js";
import "./form_element.js";
import "./list_element.js";

import "./STT/_MetaSTT.js";
import "./STT/_MetaSTTElement.js";
import "./STT/HorizontalSTT.js";
import "./STT/HorizontalSTTElement.js";
import "./STT/VerticalSTT.js";
import "./STT/VerticalSTTElement.js";
import "./STT/EditingSTT.js";
import "./STT/EditingSTTElement.js";

const UI_COLORS = [
  "red", "blue", "green", "black", "white"
]

window.FULL = 'FULL'


/**
 * Table des couleurs
 * L'user doit pouvoir les déterminer.
 */
window.COLOR_LIST = [
    {id:  'normal'      , bg:'white'     , fg: 'black'}
  , {id:  'rouge'       , bg:'red'       , fg: 'white'}
  , {id:  'vert'        , bg:'green'     , fg: 'white'}
  , {id:  'intrigue A'  , bg:'#555555'   , fg: 'white'}
  , {id:  'intrigue B'  , bg:'#555555'   , fg: 'white'}
  , {id:  'intrigue C'  , bg:'#555555'   , fg: 'white'}
].map(dcolor => {
  return Object.assign(dcolor, {data: `${dcolor.bg};${dcolor.fg}`})
})
window.COLOR_TABLE = {}
COLOR_LIST.forEach(dcolor => Object.assign(COLOR_TABLE, {[dcolor.id]: dcolor}))

window.UI_COLORS = UI_COLORS
// Pour lever une erreur juste avec 'raise("message")'
window.raise = function(message, errField){
  if ( errField ) {
    errField.classList.add('error')
    errField.focus()
    errField.select()
  }
  throw new Error(message)
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
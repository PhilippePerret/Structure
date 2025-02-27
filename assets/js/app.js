import "phoenix_html";
import "./flash.js";
import "./server_talk.js";
import "./structure.js";

const STT_COLORS = [
  "red", "blue", "green", "black", "white"
]

/**
 * Table des couleurs
 * L'user doit pouvoir les déterminer.
 */
const TABLE_COULEURS = {
    'red'   : 'red'
  , 'green' : 'green'
}

class STT {
  static init(){
    const sttName = DGet('input#structure-name').value
    Structure.load(sttName)
  }

  /**
   * Fonction qui transforme l'horloge +horloge+ en pixel (left)
   */
  static horlogeToPixels(horloge){
    return parseInt(this.horloge2seconds(horloge) * this.coef_h2p)
  }
  static horloge2seconds(horloge){
    const lh = horloge.split(/[:,\-]/).reverse()
    while (lh.length < 3) { lh.push(0) }
    const [s, m, h] = lh.map(x => {return parseInt(x, 10)})
    // console.info("[s, m, h]", [s, m, h])
    return s + m * 60 + h * 3600
  }

  static get coef_h2p(){
    return this._coef_h2p || ( this._coef_h2p = this.calcCoefSeconds2Pixels())
  }

  /**
   * Fonction qui calcul le coefficiant multiplication pour passer des 
   * secondes aux pixels
   */
  static calcCoefSeconds2Pixels(){
    const filmDuree = this.horloge2seconds(DGet('input#film-duree').value)
    const filmWidth = Structure.cadre.getBoundingClientRect().width
    return parseInt((filmWidth / filmDuree) * 1000) / 1000
  }
}

window.STT = STT;
window.STT_COLORS = STT_COLORS

window.onload = function(ev){
  STT.init()
}

STT.ctest = function(){
	if (!this.active) {
		this.active = true
    return active_lib_testor(STT)
	}
  /* === DÉBUT DES TESTS === */

  t("--- ElementForm ---")
  const Fo = ElementForm;
  [
      ["0:00", "0:00"]
    , ["0,00", "0:00"]
    , ["0:12:00", "12:00"]
    , ["0,12,00", "12:00"]
    , ["0:0+ 1", "0:01"]
    // , ["0,0+ 1", "0:01"]
    // , ["0:00+10", "0:10"]
    // , ["0:0 +60", "1:00"]
    // , ["0:00 + 3660", "1:00:00"]
    // , ["0:12 + 3660", "1:00:12"]
    // , ["0:12:0 + 3660", "1:12:00"]
    // , ["0:12:0 + 4m", "1:16:00"]
    // , ["0:12:0 + 4:0", "1:16:00"]
    // , ["0:12:0 + 4s", "1:12:04"]
    // , ["0:12:0 + 0:4", "1:12:04"]
    // , ["0:12:0 + 0,4", "1:12:04"]
    // , ["0:12:0 + 4h", "5:12:00"]
    // , ["0:12:0 + 4,0,0", "5:12:00"]
    // , ["0:12:0 + 4:0:0", "5:12:00"]
  ].forEach(paire => {
    const [sujet, expected] = paire;
    const actual = TimeCalc.treateAsOpeOnTime(sujet, false)
    equal(actual, expected)
  })

  t("--- Création d'élément ---")


}
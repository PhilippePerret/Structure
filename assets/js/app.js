import "phoenix_html";
import "./flash.js";
import "./server_talk.js";
import "./structure.js";

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
  static prepare(){
    this.positionneElementsStt()
    setTimeout(this.setVisible.bind(this), 500)
  }
  static setVisible(){this.structure.style.visibility = "visible"}
  static get structure(){
    return this._objstt || (this._objstt = DGet('div#structure'))
  }

  /**
   * Fonction principale qui met en position les éléments de la structure
   */
  static positionneElementsStt(){
    // --- Position temporelle de l'élément ---
    DGetAll('*[time],*[temps]').forEach( el => {
      const htime = el.getAttribute('time') || el.getAttribute('temps')
      el.style.left = `${this.horlogeToPixels(htime)}px`
    })
    // --- Durée de l'élément ---
    DGetAll('*[duration],*[duree]', this.structure).forEach( el => {
      console.log("Traitement durée de", el)
      const hwidth = el.getAttribute('duration') || el.getAttribute('duree')
      el.style.width = `${this.horlogeToPixels(hwidth)}px`
    })
    DGetAll('*[color]').forEach(el => {
      const [bg,fg] = el.getAttribute('color').split(/[-,;\.]/);
      el.style.backgroundColor = bg;
      el.style.color = fg;
    })
    DGetAll('*[top]').forEach(el => {
      el.style.top = `${el.getAttribute('top')}px`;
    })
  }

  static positionneElement(elt) {
    console.error("Je dois apprendre à positionner une élément dans la structure.")
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
    const filmWidth = this.structure.getBoundingClientRect().width
    return parseInt((filmWidth / filmDuree) * 1000) / 1000
  }
}

window.STT = STT;

window.onload = function(ev){
  STT.init()
}
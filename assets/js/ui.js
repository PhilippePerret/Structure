'use strict';

class UI {
  static init(){
    const sttName = DGet('input#structure-name').value
    Structure.load(sttName);
    this.prepare()
  }
  static prepare(){
    // Des class .error ont pu être ajoutées aux champs contenant
    // une mauvaise valeur. Il faut la supprimer dès qu'on blurre
    // de ce champ par bienveillance. On en profite aussi pour 
    // supprimer l'éventuel message d'erreur.
    DGetAll('input[type="text"],textarea').forEach(domE => {
      domE.addEventListener('blur', function(ev){
        domE.classList.remove('error')
        DGetAll('div.flash-message').forEach(div => div.remove())
        return true
      })
    })

    // Le formulaire
    FormElement.prepare()

    // Le listing
    ListElement.prepare()
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

window.UI = UI;
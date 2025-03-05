'use strict';

class UI {
  static init(){
    this.prepare()
    MetaSTT.init()
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

    // Pour sélectionner tout le contenu dans input-text dans lequel
    // on focus
    DGetAll('input[type="text"]').forEach(input => {
      input.addEventListener('focus', function(){
        setTimeout(input.select.bind(input), 300)
      })
    })

    // Observation des champs pour définir le nom et le path de la
    // structure pour pouvoir enregistrer la structure
    ;['input#structure-name', 'input#structure-path', 'input#film-duree'].forEach(field_sel => {
      DGet(field_sel).addEventListener('change', MetaSTT.setCurrentModified.bind(MetaSTT))
    })
    // Observation de la structure horizontale (notamment pour qu'un
    // double-click permet de créer un élément)
    HorizontalSTT.observe()

    // Le formulaire
    FormElement.prepare()

    // La boite d'édition des tags
    Tag.prepare()

  }

  static setModified(modified = true) {
    this.mLight.classList[modified?'add':'remove']('on')
    this.saveBtn.disabled = !modified;
  }
  static get mLight(){return this._mlight || (this._mlight = DGet('div#mod-light'))}
  static get saveBtn(){return this._savebtn || (this._savebtn = DGet('button#main-btn-save'))}

  /**
   * Fonction qui calcul le coefficiant multiplication pour passer des 
   * secondes aux pixels
   */
  static calcCoefSeconds2Pixels(){
    const filmDuree = TimeCalc.h2s(DGet('input#film-duree').value)
    const gabarit = DGet('div#stt-horizontalstt div#gabarit')
    const filmWidth = gabarit.getBoundingClientRect().width || window.innerWidth
    return parseInt((filmWidth / filmDuree) * 1000) / 1000
  }


  static get footerHeight(){
    return DGet('footer').offsetHeight
  }
  static get headerHeight(){
    return DGet('header').offsetHeight
  }
}

window.UI = UI;
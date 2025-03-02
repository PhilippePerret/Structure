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

    // Observation de la structure horizontale (notamment pour qu'un
    // double-click permet de créer un élément)
    HorizontalSTT.observe()

    // Le formulaire
    FormElement.prepare()

  }

  /**
   * Fonction qui calcul le coefficiant multiplication pour passer des 
   * secondes aux pixels
   */
  static calcCoefSeconds2Pixels(){
    const filmDuree = TimeCalc.h2s(DGet('input#film-duree').value)
    const gabarit = DGet('div#stt-horizontalstt div#gabarit')
    const filmWidth = gabarit.getBoundingClientRect().width
    return parseInt((filmWidth / filmDuree) * 1000) / 1000
  }
}

window.UI = UI;
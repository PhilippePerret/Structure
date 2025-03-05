'use strict';
/**
 * Gestion de la ligne de tension
 * 
 * La ligne de tension permet de gérer l'intensité du film de façon
 * visuelle à l'aide d'un ligne de plus en plus rouge en fonction
 * de la tension et de plus en plus bleu en fonction de l'absence de
 * cette tension.
 * 
 * La ligne de tension est une propriété de la métastructure : 
 *    MetaSTT.tensionLine
 * Pour la rafraichir ou l'afficher la première fois, on appelle :
 *    <MetaSTT>.tensionLine.refresh()
 * 
 */

const LIGHT_BLUE = '#baf8ff';
const DARK_BLUE  = '#0061ff';
const LIGHT_RED  = '#ffc3c3';
const DARK_RED   = '#ff0000';
class TensionLine {

  constructor(metaStt) {
    this.metaStt = metaStt
  }


  refresh(element){
    this.obj.innerHTML = ""
    if ( element ) {
      // Il faut rafraichir seulement l'élément
      this.refreshElement(element)
    } else {
      // Il faut rafraichir toute la ligne
      this.metaStt.elements.forEach(element => this.refreshElement(element))
    }
  }

  refreshElement(element){
    if ( null === element.tension || element.type != 'scene' ) return ;
    // console.info("La tension de l'élément est définie", element, element.tension, element.tensionData)
    const {level, time} = element.tensionData
    const classPolarity = level < 0 ? 'negative' : 'positive';
    const o = DCreate('DIV', {class: `tension ${classPolarity}`})
    o.style.left  = element.left
    o.style.width = element.width
    const light_color = level < 0 ? LIGHT_BLUE : LIGHT_RED ;
    const dark_color  = level < 0 ? DARK_BLUE : DARK_RED ;
    // Calcul de la position du maximum de tension/harmonie
    // Dans le linear-gradient, il doit être exprimé en pourcentage 
    // de longueur.
    let pct;
    if ( isNullish(time) ) pct = "50";
    else { pct = parseInt(100 / (element.realDuree / time)) }
    o.style.background = `linear-gradient(90deg, ${light_color} 0%, ${dark_color} ${pct}%, ${light_color} 100%)`;
    o.style.opacity = 1 - (1 / Math.abs(level)) 
    this.obj.appendChild(o)
    // console.log("Objet tension", o)
  }


  get obj(){return this._obj || (this._obj = DGet('div#tension-line'))}
}
window.TensionLine = TensionLine;
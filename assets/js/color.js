'use strict';
/**
 * Module Color
 * -------------
 * Pour gérer la couleur fond/police.
 */

const SEUIL_DARKNESS = 132

/**
 * Table des couleurs
 * L'user doit pouvoir les déterminer.
 */
const COLOR_LIST = [
  {id:  'normal'      , bg:'white'     , fg: 'black'}
, {id:  'rouge'       , bg:'red'       , fg: 'white'}
, {id:  'vert'        , bg:'green'     , fg: 'white'}
, {id:  'intrigue A'  , bg:'#555555'   , fg: 'white'}
, {id:  'intrigue B'  , bg:'#555555'   , fg: 'white'}
, {id:  'intrigue C'  , bg:'#555555'   , fg: 'white'}
].map(dcolor => {
return Object.assign(dcolor, {data: `${dcolor.bg};${dcolor.fg}`})
})
const COLOR_TABLE = {}
COLOR_LIST.forEach(dcolor => Object.assign(COLOR_TABLE, {[dcolor.id]: dcolor}))

const UI_COLORS = [
  "red", "blue", "green", "black", "white"
]

class Color {

  static get(colorId, defaultId = 'normal'){
    return COLOR_TABLE[colorId] || COLOR_TABLE[defaultId] 
  }

  static buildColorMenus(container){
    container || raise(`Container introuvable…`)
    COLOR_LIST.forEach( dcolor => {
      const {id, bg, fg} = dcolor
      const opt = DCreate('OPTION', {value: id, text: id})
      opt.dataset.bg = bg
      opt.dataset.fg = fg
      container.appendChild(opt)
    })
  }

  static isDark(couleur){
    return this.luminescenceOf(couleur) < SEUIL_DARKNESS ;
  }

  /**
   * Calcul la luminescence d'une couleur
   */
  static luminescenceOf(couleur) {
    if ( couleur.startsWith('#') ) couleur = couleur.substring(1, 7);
    console.log("couleur '%s'", couleur)
    const R = parseInt(couleur.substring(0, 2),16)
    const G = parseInt(couleur.substring(2, 4),16)
    const B = parseInt(couleur.substring(4, 6),16)

    const L = 0.299 * R + 0.587 * G + 0.114 * B

    return L
  }
}

window.Color = Color;
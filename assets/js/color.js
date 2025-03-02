'use strict';
/**
 * Module Color
 * -------------
 * Pour gérer la couleur fond/police.
 */

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
}

window.Color = Color;
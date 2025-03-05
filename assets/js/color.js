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
  // On ajoute la donnée :data à la table ci-dessus
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

  /**
   * Boucle sur chaque couleur définie
   * 
   * @param {Function} method La fonction recevant en premier argument les données de la couleur.
   */
  static each(method){
    COLOR_LIST.forEach( dcolor => method(dcolor))
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

  /**
   * Construit les couleurs sous forme de cases à cocher et les place
   * dans le container +container+
   * 
   * On fait :
   *    cb.dataset.id pour obtenir l'identifiant
   *    cb.dataset.bg pour obtenir la couleur de fond et 
   *    cb.dataset.fg pour obtenir la couleur de premier plan.
   * 
   * @param {DOMElement} container Un Element DOM valide (div)
   */
  static buildColorCbs(container){
    container || raise(`Container introuvable…`)
    COLOR_LIST.forEach( dcolor => {
      const {id, bg, fg} = dcolor
      const cbId = MetaSTTElement.getNewId('cbcolor')
      const div = DCreate('DIV', {style: "display:inline-block;width:30%;"})
      const cb = DCreate('INPUT', {type: 'checkbox', id: cbId})
      const lab = DCreate('LABEL', {text: id})
      lab.setAttribute('for', cbId)
      cb.dataset.bg = bg
      cb.dataset.fg = fg
      cb.dataset.id = id
      div.appendChild(cb)
      div.appendChild(lab)
      container.appendChild(div)
    })
  }

  /**
   * Permet de mettre le fond ou la police du champ d'édition de la
   * couleur définie dans le champ d'édition.
   * 
   * @param {DomElement} input L'élément DOM, un input-text définissant une couleur
   * @param {Boolean} forBackground Si true, on colorise le fond, sinon la police
   */
  static onChangeColorIn(input, forBackground = true){
    const color = input.value;
    input.value = color;
    input.style.color = this.contreCouleur(color)
    input.style.backgroundColor = `#${color}`
  }

  static isDark(couleur){
    return this.luminescenceOf(couleur) < SEUIL_DARKNESS ;
  }

  static contreCouleur(couleur){
    return this.isDark(couleur) ? 'white' : 'black'
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

  // ==== POUR LA PARTIE ÉDITION DES COULEURS =====

  static edit(){
    this.panelEdition.classList.remove('hidden')
    this.colorField.value = COLOR_LIST
      .map(dc => {return `${dc.id}, ${dc.bg}, ${dc.fg}`})
      .join("\n")
  }
  // Enregistrement des couleurs définies
  static save(){
    const data = this.colorField
                  .value.split("\n")
                  .replace("\r", "")
                  .filter(line => {return !line.startsWith('#')})
                  .map(line => {
                    const s = line.split(/[,;]/)
                    const bg = s[1]
                    const fb = s[2] || this.contreCouleur(bg)
                    return {id: s[0], bg: bg, fg: fg}
                  })
    // On affecte les couleurs à la structure courante
    MetaSTT.current.setColors(data)
    // On actualise les couleurs courantes
    // On ferme la fenêtre
    this.hide()
  }
  static hide(){
    this.panelEdition.classList.add('hidden')
  }

  static get colorField(){return this._colorfield || (this._colorfield = DGet('textarea#color-editor', this.panelEdition))}
  static get panelEdition(){return this._paneledit || (this._paneledit = DGet('div#color-edition-panel'))}
}

window.Color = Color;
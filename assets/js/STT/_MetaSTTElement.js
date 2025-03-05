'use strict';

window.ELEMENT_PROPERTIES_DATA = {
    id:       {default: null    , afterGet: null, beforeSet: null}
  , time:     {default: null    , afterGet: TimeCalc.treate.bind(TimeCalc)}
  , pitch:    {default: null}
  , duree:    {default: '2:00'  , afterGet: TimeCalc.treateDuree.bind(TimeCalc)}
  , type:     {default: 'scene' , afterGet: null, beforeSet: null}
  , ideality: {default: 'none'}
  , color:    {default: 'normal'}
  , tension:  {default: null}
  , tags:     {
        default: []
      , beforeSet: function(tags){return tags.join(", ")}
      , afterGet:  function(tags){return tags.split(",").map(tag => {return tag.trim()})}
    }
}
window.DEFAULT_VALUES = {
  id: ""
, time: ""
, duree: "2:00"
, type: "scene"
, ideality: "none"
, pitch: ""
, color: "normal"
, tension: ""
, tags: ""
}
window.ELEMENT_PROPERTIES = Object.keys(DEFAULT_VALUES)


class MetaSTTElement {

  /**
   * Fonction qui calcule et fournit un identifiant unique pour le
   * type +pref+ (scene, seq, cb, etc.)
   */
  static getNewId(prefix = 'sttelt'){
    const partDate = String(new Date().getTime()).replace("\.", "")
    const partAlea = String(parseInt(Math.random() * 100))
    const chunk4 = (partDate + partAlea).match(/.{1,4}/g)
    return `${prefix}-${chunk4.join("-")}`
  }

  /**
   * Un élément par défaut
   */
  static get defaultElement(){
    return {
        id: this.getNewId()
      , pitch: "Pitch de l'élément"
      , ideality: "none"
      , type: 'scene'
      , time: '0:00:00'
      , duree: '2:00'
      , tension: ''
      , tags: []
      , color: ''
    }
  }

  // ======== I N S T A N C E ==========

  constructor(data){
    this.data = data || {}
  }

  show(){this.obj.classList.remove('hidden')}
  hide(){this.obj.classList.add('hidden')}

  /**
   * Toutes les propriétés de l'élément structurel, que ce soit une
   * scène ou une séquence (ou autre à l'avenir)
   */
  // Saved Data
  get id(){return this.data.id }
  get pitch(){return this.data.pitch}
  get ideality(){return this.data.ideality}
  get type(){return this.data.type}
  get stype(){return this.data.stype}
  get time(){return this.data.time}
  get duree(){return this.data.duree}
  get tension(){return NullIfEmpty(this.data.tension)}
  get tags(){return this.data.tags}
  get color(){return this.data.color}
  // Volatile Data
  get left(){return this._left || (this._left = `${TimeCalc.horlogeToPixels(this.time)}px`)}
  get width(){return this._width || (this._width = `${TimeCalc.horlogeToPixels(this.duree)}px`)}
  get realTime(){return this._realtime || (this._realtime = TimeCalc.h2s(this.time))}
  get realDuree(){return this._realduree || (this._realduree = TimeCalc.h2s(this.duree))}
  get TYPE(){return this._typemaj || (this._typemaj = this.type.toUpperCase())}
  get colorData(){return Color.get(this.color)}
  get fgColor(){return this.colorData.fg}
  get bgColor(){return this.colorData.bg}
  get tensionData(){return this._tensiondata || (this._tensiondata = this.defineTensionData())}
  get tagsAsMap(){return this._tagsasmap || (this._tagsasmap = this.getTagsAsMap())}
  /**
   * Forcer la réactualisation des données après un changement.
   */
  reset(){
    this.built = false
    delete this._realtime
    delete this._realduree
    delete this._typemaj
    delete this._tensiondata
    delete this._left
    delete this._width
    delete this._tagsasmap
  }

  /**
   * @return True si l'élément contient le tag +tag+
   */
  hasTag(tag){
    return this.tagsAsMap[tag] === true
  }

  /**
   * Fonction générique recevant tout changement de valeur, que ce
   * soit dans un input-text, un input-checkbox, un select ou un
   * textarea
   * 
   * @param {String} property Le nom de la propriété (name, type, tension, etc.)
   * @param {Event} ev L'évènement généré
   */
  onChangeValue(property, ev){
    this.parent.setModified()
    // Les choses à faire en fonction du type de l'élément modifié
    switch(property){
      case 'tension':
        this._tensiondata = null
        this.parent.tensionLine.refresh(this);
        break;
      case 'time':
        this.onChangeTime('time'); break;
      case 'duree':
        this.onChangeTime('duree'); break;
    }
  }

  /**
   * Construit et retourne une table avec en clé les tags de 
   * l'élément et en valeur True. Cela permet d'accélerer le
   * filtrage par tag (cf. le filtre)
   */
  getTagsAsMap(){
    const map = {}
    console.info("tags", this.tags)
    if ('string' == typeof this.tags) {
      this.data.tags = this.tags.split(",").map(tag => {return tag.trim()})
      MetaSTT.current.setModified()
    }
    ;(this.tags||[]).forEach(tag => Object.assign(map, {[tag]: true}))
    return map
  }

  defineTensionData(){
    const tension = NullIfEmpty(this.tension)
    if ( null === tension ) return null;
    const found = tension.match(REG_TENSION)
    if ( ! found ) {
      Flash.error(`La tension '${tension}' est mal définie (±0-9[;horloge])`)
      return null
    }
    let [_tout, level, time] = found
    level = parseInt(level)
    time = NullIfEmpty(time)
    if ( time ) time = TimeCalc.treate(time, null, 'seconds');
    return {level: level, time: time}
  }
}


const REG_TENSION = new RegExp(`(\-?(?:[0-9]))(?:\;([0-9\:hms\+\-]+))?$`);

window.MetaSTTElement = MetaSTTElement;
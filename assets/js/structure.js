'use strict';

const FULL = 'FULL'

function nullIfEmpty(value){
  return value.trim() == "" ? null : value
}

class Structure {

  /**
   * Chargement de la structure
   */
  static load(sttName){
    ServerTalk.dial({
        route: "structure/load"
      , method: "POST"
      , data: {structure_path: "default"}
      , callback: this.afterLoad.bind(this) 
    })
  }
  static afterLoad(retour){
    if (retour.ok) {
      this.current = new Structure(retour.structure)
      this.current.build()
    } else {
      Flash.error(retour.error)
    }
  }

  /**
   * Sauvegarde de la structure
   */
  static save(){
    ServerTalk.dial({
        route: "/structure/save"
      , data:  {structure: this.getData()}
      , callback: this.afterSave.bind(this)
    })
  }
  static afterSave(retour){
    if (retour.ok) {
      console.info("Structure sauvegardée")
    } else {
      Flash.error(retour.error)
    }
  }

  static get cadre(){return this._cadre || (this._cadre = DGet('div#structure'))}
  static masquer_cadre(){this.setCadreVisi(false)}
  static display_cadre(){setTimeout(this.setCadreVisi.bind(this, true), 100)}
  static setCadreVisi(visible){this.cadre.style.visibility = visible ? "visible" : "hidden"}


  /**
   * Fonction principale pour actualiser une élément de la structure
   */
  static update(){
    Structure.masquer_cadre()
    console.log("Je dois apprendre à updater")

  }

  // =========  I N S T A N C E   S T R U C T U R E  =============

  constructor(data){
    this.data = data
    this.elements = []; // pour liste des instances d'élément
    this.table    = {};
  }
  get metadata(){return this.data.metadata}
  get data_elements(){return this.data.elements}
  get preferences(){return this.data.preferences}

  /**
   * CONSTRUCTION DE LA STRUCTURE
   * ----------------------------
   * Fonction principale qui construit la structure définie
   */
  build(){
    Structure.masquer_cadre()
    this.data.elements.forEach( delement => {
      const elt = new SttElement(delement)
      this.elements.push(elt)
      Object.assign(this.table, {[elt.id]: elt})
      elt.build()
    })
    Structure.display_cadre()
  }

  /**
   * Fonction appelée pour ajouter l'élément
   */
  addElement(element){
    this.elements.push(element)
  }
}

/**
 * Gestion de l'édition d'un élément de structure
 */
class SttElement {

  static getNewId(type){
    const partDate = String(new Date().getTime()).replace("\.", "")
    const partAlea = String(parseInt(Math.random() * 100))
    const chunk4 = (partDate+partAlea).match(/.{1,4}/g)
    return type + "-" + chunk4.join("-")
  }

  /**
   * Foncton appelée par le bouton "Enregistrer" du formulaire
   * d'édition de l'élément
   */
  static createOrUpdate(){
    const dataElement = ElementForm.getData()
    if ( ElementForm.areValidData(dataElement) ) {
      if ( dataElement.id ) {
        this.updateElement(dataElement)
      } else /* création */ {
        this.createElement(dataElement)
      }
    } else /* Données invalides */ {
      return false
    }
  }

  static updateElement(data){
    const element = Structure.current.getElement(data.id)
    element.update(data)
    console.info("Je dois apprendre à updater l'élément d'id", data.id)
  }
  static createElement(data){
    data.id = this.getNewId(data.type)
    console.info("Je dois apprendre à créer l'élément avec", data)
    const newElement = new SttElement(data)
    Structure.current.addElement(newElement)
    newElement.build()
  }

  // --- INSTANCE ---

  constructor(data){
    this.data = data
  }

  get id(){return this.data.id || SttElement.getNewId(this.data.type) }
  get text(){return this.data.pitch || this.data.text}
  get type(){return this.data.type}
  get time(){return this.data.time || "0:00"}
  get duree(){return this.data.duree || "2:00"}
  get tension(){return this.data.tension || ""}
  get color(){return this.data.color || ""}


  edit(ev){
    ElementForm.setData(this)
  }

  build(){
    const data = this.data || this.getData() // à supprimer, on doit maintenant toujours envoyer les données à l'instanciation
    const eltId = `elt-${this.id}`
    const div = DCreate(data.type.toUpperCase(), {id:eltId})
    this.obj = div
    div.appendChild(DCreate('SPAN', {text: this.text}))
    div.setAttribute("time", this.time);
    div.setAttribute("duree", this.duree);
    data.stype && (this.setClass(data.style));
    Structure.cadre.appendChild(this.obj)

    this.positionne()
    this.observe()
  }

  observe(){
    this.obj.addEventListener('dblclick', this.edit.bind(this))
  }
  positionne(){
    this.obj.style.left = `${STT.horlogeToPixels(this.data.time || "0:00")}px`
    this.data.duree && (this.obj.style.width = `${STT.horlogeToPixels(this.data.duree)}px`);
    this.data.top   && (this.obj.style.top = `${this.data.top}px`);
    this.data.color && this.setColor();
  }
  setClass(dClass) {
    dClass = dClass || this.data.stype;
    var css; 
    if ( 'string' == typeof dClass ) {
      css = dClass
    } else {
      css = dClass.join(" ")
    }
    this.obj.className = css
  }
  setColor(dColor){
    dColor = dColor || this.data.color
    const [bg,fg] = dColor.split(/[-,;\.]/);
    this.obj.style.backgroundColor = bg;
    this.obj.style.color = fg;
  }
}

class ElementForm {

  /**
   * Vérifie la validité des données. Retourne true en cas de succès
   * ou false en cas de problème, en affichant les erreurs
   */
  static areValidData(data){
    try {
      if (data.pitch === null || data.pitch.length < 10) throw new Error("Pitch trop court (> 10)");
      // TODO Vérifier que le pitch soit unique si c'est une création
      if (data.time === null || this.NotATime(data.time)) throw new Error("Le time doit être une horloge valide.")
      if ( this.NotATime(data.duree) ) throw new Error("La durée doit être une horloge valide.")
      if (data.tension !== null && this.NotATension(data.tension)) throw new Error("La tension n'est pas une tension valide.")
      if (data.color !== null && this.NotAColor(data.color)) throw new Error("La couleur n'est pas une couleur valide.")
      return true
    } catch(err) {
      Flash.error(err.message) + "\nImpossible d'enregistrer l'élément."
      return false
    }
  }

  static NotATime(horloge){return !this.IsATime(horloge)}
  static IsATime(horloge){return this.regHorloge.test(horloge) === true}
  static get regHorloge(){
    if ( undefined === this._reghorloge ) {
      this._reghorloge = new RegExp("^[0-9]{1,2}[\:,][0-9]{1,2}([\:,][0-9]{1,2})?$")
    }; return this._reghorloge
  }

  static NotATension(tension){return !this.IsATension(tension)}
  static IsATension(tension){return this.regTension.test(tension) === true}
  static get regTension(){
    if (undefined == this._regtension){
      this._regtension = new RegExp("^[0-9]\;[0-9]{1,2}[\:,][0-9]{1,2}([\:,][0-9]{1,2})?$")
    } return this._regtension;
  }

  static NotAColor(color){return !this.IsAColor(color)}
  static IsAColor(color){return true === this.regColor.test(color)}
  static get regColor(){
    if (undefined == this._regcolor) {
      const colors = STT_COLORS.join("|")
      this._regcolor = new RegExp("^("+colors+")\;("+colors+")$")
    }; return this._regcolor
  }


  static getData(){
    return {
        id:       nullIfEmpty(this.fieldId.value)
      , type:     nullIfEmpty(this.fieldType.value)
      , pitch:    nullIfEmpty(this.fieldPitch.value)
      , time:     TimeCalc.treateAsOpeOnTime(nullIfEmpty(this.fieldTime.value), FULL)
      , duree:    nullIfEmpty(this.fieldDuree.value)    || "2:00"
      , color:    nullIfEmpty(this.fieldColor.value)    || "white:black"
      , tension:  nullIfEmpty(this.fieldTension.value)
    }
  }
  static setData(data){
    this.fieldId.value      = data.id
    this.fieldType.value    = data.type
    this.fieldPitch.value   = data.pitch
    this.fieldTime.value    = data.time
    this.fieldDuree.value   = data.duree
    this.fieldColor.value   = data.color
    this.fieldTension.value = data.tension
  }
  static get fieldId(){return this._fieldid || (this._fieldid = DGet('input#elt-id'))}
  static get fieldType(){return this._fieldtype || (this._fieldtype = DGet('select#elt-type'))}
  static get fieldPitch(){return this._fieldpitch || (this._fieldpitch = DGet('input#elt-pitch'))}
  static get fieldTime(){return this._fieldtime || (this._fieldtime = DGet('input#elt-time'))}
  static get fieldDuree(){return this._fielduree || (this._fielduree = DGet('input#elt-duree'))}
  static get fieldColor(){return this._fieldcolor || (this._fieldcolor = DGet('input#elt-color'))}
  static get fieldTension(){return this._fieldtension || (this._fieldtension = DGet('input#elt-tension'))}
}

class TimeCalc {

  static h2s(h){
    const segs = h.split(/[,:]/).reverse().map(x => {return parseInt(x)})
    let s = segs[0] || 0;
    let m = segs[1] || 0;
    h = segs[2] || 0;
    return s + m * 60 + h * 3600
  }
  static s2h(s, full = false){
    const h = parseInt(s / 3600)
    s = s - h * 3600
    let m = parseInt(s / 60)
    m = (full == FULL && m < 10) ? `0${m}` : m;
    s = s - m * 60
    s = s < 10 ? `0${s}` : s;
    const res = [m, s]
    if ( full == FULL) res.push(h) ;
    return res.join(":")
  }

  /** 
   * Fonction qui traite les temps, qui permet d'utiliser des opérations
   */
  static treateAsOpeOnTime(timePlus, full = FULL){
    if ( timePlus === null ) return null;
    timePlus = timePlus.trim()
    if (ElementForm.IsATime(timePlus)) return TimeCalc.s2h(TimeCalc.h2s(timePlus), full);
    timePlus = timePlus.replace(/ /g, "")
    const [horloge, ajout] = timePlus.split("+")
    console.info("horloge", horloge)
    console.info("ajout", ajout)
    const secondes = (horloge, ajout => {
      if ( /([0-9]{1,2}([smh])){1,3}/.test(ajout) ) {
        console.info("ajout avec lettre", ajout)
      } else if ( ElementForm.IsATime(ajout) ) {
        return this.h2s(horloge) + this.h2s(ajout)
      } else {
        console.info("ajout par secondes", ajout)
        return this.h2s(horloge) + parseInt(ajout)
      }
      })(horloge, ajout)
    return this.s2h(secondes)
  }


}


window.Structure  = Structure;
window.SttElement = SttElement;
window.ElementForm = ElementForm;
window.TimeCalc = TimeCalc;
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
    if ( this.current.notSavable() ) return ;
    ServerTalk.dial({
        route: "/structure/save"
      , data:  {structure: this.current.getData()}
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

  static reset(){
    if (confirm("Veux-tu vraiment tout efface ?")){
      this.cadre.innerHTML = ""
      this.current = new Structure(this.defaultDataStructure)
    }
  }

  static get defaultDataStructure(){
    return {
        elements: []
      , metadata: {path: ''}
      , preferences: {display: 'paysage'}
    }
  }

  static get cadre(){return this._cadre || (this._cadre = DGet('div#structure'))}
  static masquer_cadre(){this.setCadreVisi(false)}
  static display_cadre(){setTimeout(this.setCadreVisi.bind(this, true), 100)}
  static setCadreVisi(visible){this.cadre.style.visibility = visible ? "visible" : "hidden"}

  /**
   * Fonction qui retourne true si le pitch +pitch+ existe déjà
   */
  static pitchExists(pitch){
    for(var elt of this.current.elements) {
      if ( elt.pitch == pitch ) return true
    }
    return false
  }

  // =========  I N S T A N C E   S T R U C T U R E  =============

  constructor(data){
    this.data = data
    this.elements = []; // pour liste des instances d'élément
    this.table    = {};
    this.applyMetadata();
    this.applyPreferences();
  }
  get metadata(){return this.data.metadata}
  get data_elements(){return this.data.elements}
  get preferences(){return this.data.preferences}

  applyMetadata(){
    DGet("input#structure-name").value = this.metadata.path
  }
  applyPreferences(){
    console.info("Je dois apprendre à appliquer les préférences")
  }

  /**
   * Fonction qui retourne false si la structure n'est pas sauvable
   */
  notSavable(){
    try {
      this.metadata.path || raise("Il faut fournir un path pour cette structure", DGet('input#structure-name'))

      return false ; // donc sauvable
    } catch(erreur) {
      Flash.error(erreur.message)
      return true
    }
  }
  /**
   * Fonction qui retourne les données de la structure (en premier 
   * lieu pour l'enregistrer)
   */
  getData(){
    return {
        metadata: this.metadata
      , preferences: this.preferences
      , elements: this.elements.map(elt => {return elt.data})
    }
  }
  /**
   * CONSTRUCTION DE LA STRUCTURE
   * ----------------------------
   * Fonction principale qui construit la structure définie
   */
  build(){
    Structure.masquer_cadre()
    this.data.elements.forEach( delement => {
      if ( !delement.id ) { delement.id = SttElement.getNewId(delement.type)}
      const elt = new SttElement(delement)
      this.elements.push(elt)
      Object.assign(this.table, {[elt.id]: elt})
      elt.build()
    })
    Structure.display_cadre()
  }

  /**
   * Fonction retournant l'élément d'identifiant +id+
   */
  getElement(id){
    return this.table[id]
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
    console.info("element", element)
    element.update(data)
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
    this.editBinding = this.edit.bind(this)
  }

  get id(){return this.data.id }
  get pitch(){return this.data.pitch || this.data.text}
  get type(){return this.data.type}
  get time(){return this.data.time || "0:00"}
  get duree(){return this.data.duree || "2:00"}
  get tension(){return this.data.tension || ""}
  get color(){return this.data.color || ""}


  edit(ev){
    ElementForm.setData(this)
  }

  update(newData){
    this.data = newData
    this.unobserve()
    this.obj.remove()
    this.build()
  }

  build(){
    const data = this.data || this.getData() // à supprimer, on doit maintenant toujours envoyer les données à l'instanciation
    const eltId = `elt-${this.id}`
    const div = DCreate(data.type.toUpperCase(), {id:eltId})
    this.obj = div
    div.appendChild(DCreate('SPAN', {text: this.pitch}))
    div.setAttribute("time", this.time);
    div.setAttribute("duree", this.duree);
    data.stype && (this.setClass(data.style));
    Structure.cadre.appendChild(this.obj)

    this.positionne()
    this.observe()
  }

  observe(){
    this.listen(this.obj, 'add', 'dblclick', this.editBinding)
  }
  unobserve(){
    this.listen(this.obj, 'remove', 'dblclick', this.editBinding)
  }
  listen(obj, ope, eventType, method){
    obj[`${ope}EventListener`](eventType, method)
  }

  positionne(){
    this.obj.style.left = `${STT.horlogeToPixels(this.data.time || "0:00")}px`
    this.duree && this.type == 'seq' && (this.obj.style.width = `${STT.horlogeToPixels(this.duree)}px`);
    this.top   && (this.obj.style.top = `${this.top}px`);
    this.color && this.setColor();
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
    const isNew = data.id == null;
    try {
      if (data.pitch === null || data.pitch.length < 10) raise("Pitch trop court (< 10 caractères)", this.fieldPitch);
      // TODO Vérifier que le pitch soit unique si c'est une création
      if ( isNew && Structure.pitchExists(data.pitch)) raise("Ce pitch existe déjà.", this.fieldPitch)
      if (data.time === null || this.NotATime(data.time)) raise("Le time doit être une horloge valide.", this.fieldTime)
      if ( this.NotATime(data.duree) ) raise("La durée doit être une horloge valide.", this.fieldDuree)
      if (data.tension && this.NotATension(data.tension)) raise("La tension n'est pas une tension valide.", this.fieldTension)
      if (data.color && this.NotAColor(data.color)) raise("La couleur n'est pas une couleur valide.", this.fieldColor)
      return true
    } catch(err) {
      Flash.error(err.message) + "\nImpossible d'enregistrer l'élément."
      return false
    }
  }

  /**
   * Pour réinitialiser tous les champs
   */
  static reset(){
    this.setData({})
    this.fieldType.focus()
  }

  static getData(){
    // Traitement des temps qu'on doit évaluer
    const time = TimeCalc.treate(nullIfEmpty(this.fieldTime.value), FULL)
    this.fieldTime.value = time;
    const duree = TimeCalc.treate(nullIfEmpty(this.fieldDuree.value)) || "2:00"
    this.fieldDuree.value = duree;
    return {
        id:       nullIfEmpty(this.fieldId.value)
      , type:     nullIfEmpty(this.fieldType.value)
      , pitch:    nullIfEmpty(this.fieldPitch.value)
      , time:     time
      , duree:    duree
      , color:    nullIfEmpty(this.fieldColor.value)
      , tension:  nullIfEmpty(this.fieldTension.value)
    }
  }
  static setData(data){
    this.fieldId.value      = data.id || ""
    this.fieldType.value    = data.type || "scene"
    this.fieldPitch.value   = data.pitch || ""
    this.fieldTime.value    = data.time || ""
    this.fieldDuree.value   = data.duree || ""
    this.fieldColor.value   = data.color || ""
    this.fieldTension.value = data.tension || ""
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
      this._regtension = new RegExp("^[0-9](\;[0-9]{1,2}[\:,][0-9]{1,2}([\:,][0-9]{1,2})?)?$")
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
    m = ((full == FULL || h) && m < 10) ? `0${m}` : m;
    s = s - m * 60
    s = s < 10 ? `0${s}` : s;
    const res = [m, s]
    if ( h || full == FULL) res.unshift(h) ;
    return res.join(":")
  }

  static get reghorl(){
    return "([0-9]{1,4}(?:[:,][0-9]{1,2})?(?:[:,][0-9]{1,2})?)"
  }
  static get REG_HORLOGE(){
    return this._reghor || (this._reghor = new RegExp(`^${this.reghorl}$`))
  }
  static get REG_HORLOGE_WITH_OPE(){
    return this._regopeh || (this._regopeh = new RegExp(`^${this.reghorl}([+\-])(.+)$`))
  }

  /** 
   * Fonction qui traite les temps, qui permet d'utiliser des opérations
   */
  static treate(timePlus, full = FULL){
    if ( timePlus === null ) return null;
    timePlus = timePlus.trim().replace(/ /g, "")
    let segs = timePlus.match(this.REG_HORLOGE_WITH_OPE)
    if ( segs === null ) {
      if ( timePlus.match(this.REG_HORLOGE) ) {
        full = this.isRequiredFullHorloge(timePlus, full)
        return TimeCalc.s2h(TimeCalc.h2s(timePlus), full);
      } else {
        // Sinon, on considère que c'est juste l'"ajout" qui est
        // fourni, par exemple l'expression "12h 4m"
        segs = [null, "0:00", "+", timePlus]
      }
    }
    let [_tout, horloge, operation, ajout] = segs
    // console.info("horloge", horloge)
    // Si le format de départ de l'horloge est une horloge complète, 
    // on doit retourner une horloge complète
    full = this.isRequiredFullHorloge(horloge, full)
    // Dans le cas où ajout n'est pas défini et que horloge n'est pas
    // une horloge, c'est que c'est juste l'opération qui est fournie
    if ( ajout == "" && ElementForm.NotATime(horloge) ) {
      [horloge, ajout] = ["0:00", horloge]
    }
    const secondes = ((horloge, ajout, operation) => {
      if ( /([0-9]{1,2}([smh])){1,3}/.test(ajout) ) {
        ajout = [...ajout.matchAll(/[0-9]{1,3}[smh]/g)].map(res => {return res[0]}).join("+")
        ajout = ajout.replace(/m/g,"*60").replace(/s/g,"").replace(/h/g,"*3600")
        return this.makeOpe(this.h2s(horloge), eval(ajout), operation)
      } else if ( ElementForm.IsATime(ajout) ) {
        return this.makeOpe(this.h2s(horloge), this.h2s(ajout), operation)
      } else {
        return this.makeOpe(this.h2s(horloge), eval(ajout), operation)
      }
      })(horloge, ajout, operation)
    return this.s2h(secondes, full)
  }

  static makeOpe(term1, term2, ope){
    if (ope == "+") {
      return term1 + term2
    } else {
      return term1 - term2
    }
  }

  // @return FULL s'il faut retourner une horloge complète ou false
  // dans le cas contraire.
  // On doit retourner une horloge complète (même s'il n'y a pas
  // d'heures ou de minutes) si +full+ est FULL ou si l'horloge 
  // fournie est complète.
  static isRequiredFullHorloge(horloge, full){
    if ( full == FULL ) return full ;
    return horloge.split(/[,:]/).length == 3 ? FULL : false ;
  }

}


window.Structure  = Structure;
window.SttElement = SttElement;
window.ElementForm = ElementForm;
window.TimeCalc = TimeCalc;
'use strict';

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

  /**
   * Fonction pour ajouter ou actualiser
   */
  static createOrUpdate(){
    console.log("Je dois apprendre à créer ou actualiser")
  }

  /**
   * Fonction principale pour ajouter un élément à la structure
   */
  static create(){
    console.log("Je dois apprendre à ajouter un élément.")
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

  /**
   * Retourne les données de la structure, c'est-à-dire la liste
   * de tous les éléments créés
   */
  static getData(){
    return {
      elements: [
          {type: 'scene', text: 'Incident déclencheur', stype: 'biais main', time: '12:00', duree: '2:00', tension: '3'}
        , {type: 'scene', text: 'La scène normal à plat', time: '12:00'}
        , {type: 'seq', text: "Introduction", stype: 'meta', color: "green;white"}
        , {type: 'seq', text: "Séquence non méta", stype: null, color: "red;white", duree:"10:00", temps:"15:00"}
      ]
    , metadata: {path: "default"}
    , preferences: {display: 'paysage'}}
  }


  // =========  I N S T A N C E   S T R U C T U R E  =============

  constructor(data){
    this.data = data
    this.elements = []
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
    console.log("Je dois apprendre à construire la structure.")
    this.data.elements.forEach( delement => {
      const elt = new SttElForm(delement)
      elt.build()
    })
    Structure.display_cadre()
  }
}

/**
 * Gestion de l'édition d'un élément de structure
 */
class SttElForm {

  static getNewId(){
    return String(new Date().getTime() + Math.random() * 100)
  }

  // --- INSTANCE ---

  constructor(data){
    this.data = data
  }

  get id(){return this.data.id || (this.data.id = SttElForm.getNewId())}
  get text(){return this.data.pitch || this.data.text}
  get type(){return this.data.type}
  get temps(){return this.data.temps || "0:00"}
  get duree(){return this.data.duree || "2:00"}


  edit(ev){
    console.info("Je dois apprendre à éditer l'élément", this.id)
  }

  build(){
    const data = this.data || this.getData() // à supprimer, on doit maintenant toujours envoyer les données à l'instanciation
    const eltId = `elt-${this.id}`
    const div = DCreate(data.type.toUpperCase(), {id:eltId})
    this.obj = div
    div.appendChild(DCreate('SPAN', {text: this.text}))
    div.setAttribute("temps", this.temps);
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
    this.obj.style.left = `${STT.horlogeToPixels(this.data.temps || "0:00")}px`
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

  getData(){
    return {
        id:       nullIfEmpty(this.fieldId.value)
      , type:     nullIfEmpty(this.fieldType.value)
      , pitch:    nullIfEmpty(this.fieldPitch.value)
      , time:     nullIfEmpty(this.fieldTime.value)
      , duree:    nullIfEmpty(this.fieldDuree.value)    || "2:00"
      , color:    nullIfEmpty(this.fieldColor.value)    || "white:black"
      , tension:  nullIfEmpty(this.fieldTension.value)  || ""
    }
  }
  setData(data){
    this.fieldId.value      = data.id
    this.fieldType.value    = data.type
    this.fieldPitch.value   = data.pitch
    this.fieldTime.value    = data.time
    this.fieldDuree.value   = data.duree
    this.fieldColor.value   = data.color
    this.fieldTension.value = data.tension
  }
  get fieldId(){return this._fieldid || (this._fieldid = DGet('input#elt-id'))}
  get fieldType(){return this._fieldtype || (this._fieldtype = DGet('select#elt-type'))}
  get fieldPitch(){return this._fieldpitch || (this._fieldpitch = DGet('input#elt-pitch'))}
  get fieldTime(){return this._fieldtime || (this._fieldtime = DGet('input#elt-time'))}
  get fieldDuree(){return this._fielduree || (this._fielduree = DGet('input#elt-duree'))}
  get fieldColor(){return this._fieldcolor || (this._fieldcolor = DGet('input#elt-color'))}
  get fieldTension(){return this._fieldtension || (this._fieldtension = DGet('input#elt-tension'))}
}



window.Structure = Structure
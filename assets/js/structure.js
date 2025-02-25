'use strict';

function nullIfEmpty(value){
  return value.trim() == "" ? null : value
}

class Structure {

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

  /**
   * Fonction principale pour actualiser une élément de la structure
   */
  static update(){
    console.log("Je dois apprendre à updater")
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
  constructor(){

  }
  build(){
    const data = this.getData()
    if ( data.id === null ) {
      data.id = SttElForm.getNewId()
    }
    const eltId = `elt-${data.id}`
    const div = DCreate(data.type.toUpperCase(), {id:eltId, text: data.pitch})
    div.setAttribute("time", data.time)
    div.setAttribute("duree", data.duree)
    this.obj = div
    Stt.structure.appendChild(this.obj)
    Stt.positionneElement()
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
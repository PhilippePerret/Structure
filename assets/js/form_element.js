'use strict';

function nullIfEmpty(value){
  return value.trim() == "" ? null : value
}

class FormElement {

  static prepare(){
    this.buildMenuColor()
    this.observe()
  }
  static observe(){

  }

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
      , type:     this.fieldType.value
      , ideality: this.fieldIdeality.value
      , pitch:    nullIfEmpty(this.fieldPitch.value)
      , time:     time
      , duree:    duree
      , color:    this.fieldColor.value
      , tension:  nullIfEmpty(this.fieldTension.value)
    }
  }
  static setData(data){
    this.fieldId.value        = data.id || ""
    this.fieldType.value      = data.type || "scene"
    this.fieldIdeality.value  = data.ideality || "none"
    this.fieldPitch.value     = data.pitch || ""
    this.fieldTime.value      = data.time || ""
    this.fieldDuree.value     = data.duree || ""
    this.fieldColor.value     = data.color || ""
    this.fieldTension.value   = data.tension || ""
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
      const colors = UI_COLORS.join("|")
      this._regcolor = new RegExp("^("+colors+")\;("+colors+")$")
    }; return this._regcolor
  }

  static get fieldId(){return this._fieldid || (this._fieldid = DGet('input#elt-id'))}
  static get fieldType(){return this._fieldtype || (this._fieldtype = DGet('select#elt-type'))}
  static get fieldIdeality(){return this._fieldideality || (this._fieldideality = DGet('select#elt-ideality'))}
  static get fieldPitch(){return this._fieldpitch || (this._fieldpitch = DGet('input#elt-pitch'))}
  static get fieldTime(){return this._fieldtime || (this._fieldtime = DGet('input#elt-time'))}
  static get fieldDuree(){return this._fielduree || (this._fielduree = DGet('input#elt-duree'))}
  static get fieldColor(){return this._fieldcolor || (this._fieldcolor = DGet('select#elt-color'))}
  static get fieldTension(){return this._fieldtension || (this._fieldtension = DGet('input#elt-tension'))}


  /**
   * Retourne la couleur
   */
  static getColorById(id){
    return COLOR_LIST[id]
  }
  /**
   * Fonction qui construit le menu des couleurs dans le formulaire 
   * d'élément en se servant des données COLOR_LIST
   */
  static buildMenuColor(){
    COLOR_LIST.forEach( dcolor => {
      const {id, bg, fg} = dcolor
      const opt = DCreate('OPTION', {value: id, text: id})
      opt.dataset.bg = bg
      opt.dataset.fg = fg
      this.fieldColor.appendChild(opt)
    })
  }
}

window.FormElement = FormElement;
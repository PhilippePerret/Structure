'use strict';

window.NullIfEmpty = function(value){
  if ( value === null || value === undefined ) return null ;
  return value.trim() === "" ? null : value ;
}

class FormElement {

  static prepare(){
    this.buildMenuColor()
    this.observe()
  }
  static observe(){}

  static show(position){
    this.obj.classList.remove('hidden')
    if (position){
      this.obj.style.top  = `${position.y}px`
      this.obj.style.left = `${position.x}px`
      // Régle le temps
      this.fieldTime.value = position.horloge

    }
  }
  static hide(){
    this.obj.classList.add('hidden')
  }
  static get obj(){
    return this._obj || (this._obj = DGet('div#element-form'))
  }


  // ========= FONCTION D'ÉDITION DE L'ÉLÉMENT DE STRUCTURE =====

  /**
   * Foncton appelée par le bouton "Enregistrer"
   */
  static createOrUpdate(){
    const dataElement = FormElement.getData()
    if ( FormElement.areValidData(dataElement) ) {
      if ( dataElement.id /* édition */) { this.updateElement(dataElement) }
      else /* création */ { this.createElement(dataElement) }
    } else /* Données invalides */ { return false }
    FormElement.hide()
  }

  /**
   * Fonction pour actualiser l'élément
   */
  static updateElement(data){
    console.info("MetaSTT.current_dispo", MetaSTT.current_dispo)
    console.info("MetaSTT.current", MetaSTT.current)
    const element = MetaSTT.current.disposition.getElement(data.id)
    console.info("element", element)
    element.update(data)
  }

  /**
   * Fonction pour création de l'élément
   */
  static createElement(data){
    data.id = MetaSTTElement.getNewId()
    HorizontalSTT.createElement(data)
    this.hide()
  }


  /**
   * Vérifie la validité des données. Retourne true en cas de succès
   * ou false en cas de problème, en affichant les erreurs
   * 
   * @param {Object} data Les données à vérifier
   * @param {STTElement} element  L'élément édité (structure éditée) ou null pour le formulaire
   */
  static areValidData(data, element){
    console.info("element dans are-valid", element)
    const isNew = data.id == null;
    let field, otherElt;
    if ( element ) {
      const c = element
      field = {pitch: c.field('pitch'), time: c.field('time'), duree: c.field('duree'), tension: c.field('tension')}
    } else {
      field = {pitch: this.fieldPitch, time: this.fieldTime, duree: this.fieldDuree, tension: this.fieldTension}
    }
    try {
      if (data.pitch === null || data.pitch.length < 4) raise("Pitch trop court (< 4 caractères)", field.pitch);
      // Vérifier que le pitch soit unique si c'est une création
      if ( isNew && (otherElt = MetaSTT.current.pitchExists(data.pitch))) raise(`Ce pitch existe déjà (élément ${otherElt.id} à ${otherElt.time}).`, field.pitch)
      if (data.time === null || this.NotATime(data.time)) raise("Le time doit être une horloge valide.", field.time)
      if ( this.NotATime(data.duree) ) raise("La durée doit être une horloge valide.", field.duree)
      if (data.tension && this.NotATension(data.tension)) raise("La tension n'est pas une tension valide.", field.tension)
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
    const time = TimeCalc.treate(NullIfEmpty(this.fieldTime.value), FULL)
    this.fieldTime.value = time;
    const duree = TimeCalc.treate(NullIfEmpty(this.fieldDuree.value)) || "2:00"
    this.fieldDuree.value = duree;
    return {
        id:       NullIfEmpty(this.fieldId.value)
      , type:     this.fieldType.value
      , ideality: this.fieldIdeality.value
      , pitch:    NullIfEmpty(this.fieldPitch.value)
      , time:     time
      , duree:    duree
      , color:    this.fieldColor.value
      , tension:  NullIfEmpty(this.fieldTension.value)
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
      this._regtension = new RegExp("^-?[0-9](\;[0-9\:hms\+\-]+)?$")
    } return this._regtension;
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
   * Fonction qui construit le menu des couleurs dans le formulaire 
   * d'élément en se servant des données COLOR_LIST
   */
  static buildMenuColor(container){
    Color.buildColorMenus(container || this.fieldColor)
  }
}

window.FormElement = FormElement;
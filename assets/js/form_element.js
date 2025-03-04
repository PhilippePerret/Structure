'use strict';

class FormElement {

  static prepare(){
    this.buildMenuColor()
    this.observe()
  }
  static observe(){
    // Corriger les temps "en direct"
    this.fieldTime.addEventListener('change', this.onChangeATime.bind(this, this.fieldTime))
    this.fieldDuree.addEventListener('change', this.onChangeATime.bind(this, this.fieldDuree))
  }

  static onChangeATime(field, ev){
    field.value = TimeCalc.treate(field.value)
  }

  /**
   * Pour ouvrir le formulaire, mais en édition avec l'élément donné.
   * 
   * @param {Element} element Un élément structurel
   * @param {Object} position La position du click, pour placer la fenêtre au bon endroit.
   */
  static openWith(element, position){
    this.element = element
    this.show(position)
  }

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
    console.info("element", this.element)
    this.element.update(data)
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
      field = {pitch: this.field('pitch'), time: this.fieldTime, duree: this.fieldDuree, tension: this.field('tension')}
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
    this.field('pitch').focus()
  }

  /**
   * Renseigne le formulaire avec les données fournies.
   * 
   * @param {Object|HorizontalSTTElement} data Soit l'élément édité (HorizontalSTTElement) soir les données sous forme de table.
   */
  static setData(data){
    ELEMENT_PROPERTIES.forEach(prop => this.field(prop).value = data[prop]||DEFAULT_VALUES[prop])
  }

  static getData(){
    const data = {}
    ELEMENT_PROPERTIES.forEach(prop => {
      let value = NullIfEmpty(this.field(prop).value)
      if ( ELEMENT_PROPERTIES_DATA[prop].afterGet ) {
        value = ELEMENT_PROPERTIES_DATA[prop].afterGet(value)
      }
      Object.assign(data, {[prop]: value})
    })
    return data
  }

  /**
   * Retourne le champ de la propriété +prop+
   * 
   * @param {String} prop Propriété de l'élément
   */
  static field(prop){
    return DGet(`#elt-${prop}`, this.obj)
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

  static get fieldTime(){return this._fieldtime || (this._fieldtime = DGet('input#elt-time'))}
  static get fieldDuree(){return this._fielduree || (this._fielduree = DGet('input#elt-duree'))}

  /**
   * Fonction qui construit le menu des couleurs dans le formulaire 
   * d'élément en se servant des données COLOR_LIST
   */
  static buildMenuColor(container){
    Color.buildColorMenus(container || this.field('color'))
  }
}

window.FormElement = FormElement;
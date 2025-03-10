'use strict';


class EditingSTTElement extends MetaSTTElement {

  // ======== I N S T A N C E ==========

  constructor(data, stt){
    super(data)
    this.parent = stt
  }

  /**
   * Pour focusser dans le champ d'édition de la propriété +prop+
   * 
   * @param {String} prop Nom de la propriété.
   */
  focus(prop){
    const field = this.field(prop)
    field.focus()
    field.select()
  }

  /**
   * Récupération des valeurs de l'élément (quand on est en mode
   * structure editing et qu'on choisit d'enregistrer)
   */
  getData(){
    const data = {}
    for ( const prop in ELEMENT_PROPERTIES_DATA ){
      const dprop = ELEMENT_PROPERTIES_DATA[prop]
      let value = NullIfEmpty(DGet(`.elt-${prop}`, this.obj).value)
      if ( value && dprop.afterGet ) value = dprop.afterGet.call(null, value) ;
      // console.info("Valeur finale de `%s'", prop, value)
      Object.assign(data, {[prop]: value})
    }
    // Transformation de certaines valeurs
    if ( !data.id || data.id == "undefined") {
      data.id = this.data.id = this.obj.dataset.id = MetaSTTElement.getNewId()
    }
    data.time   = this.setPropValue('time',  data.time)
    data.duree  = this.setPropValue('duree', data.duree)
    // On vérifie la validité des données
    if ( false === FormElement.areValidData(data, this) ) return false ;
    this.data = data
    return data
  }

  /**
   * Applique les valeurs, en les traitant si nécessaire.
   */
  setData(){
    for ( const prop in ELEMENT_PROPERTIES_DATA ){
      const dprop = ELEMENT_PROPERTIES_DATA[prop]
      let value = this.data[prop] || dprop.default
      if ( dprop.beforeSet ) value = dprop.beforeSet.call(null, value) ;
      DGet(`.elt-${prop}`, this.obj).value = value
    }
  }

  /**
   * Remplit les champs avec leur valeur
   * @param {String} prop La propriété de l'élément
   * @param {String} value La valeur à lui donner
   */
  setPropValue(prop, value){
    this.field(prop).value = value
    return value // chainage
  }


  build(){
    this.obj = this.constructor.CLONE_ELEMENT.cloneNode(true)
    this.obj.dataset.id = this.id
    this.setData()
    // On met le résumé dans la couleur choisie
    this.color && this.applyColor()

    this.observe()

    this.built = true
  }

  applyColor(){
    const pitch   = this.field('pitch')
    const dColor  = Color.get(this.color)
    pitch.style.backgroundColor = dColor.bg
    pitch.style.color = dColor.fg

  }

  observe(){
    this.btnAdd.addEventListener('click', this.createOtherElement.bind(this))
    this.btnDel.addEventListener('click', this.onWantToDelete.bind(this))
    // Déclencheur de changement pour tous les champs d'édition
    DGetAll('input,select, textarea', this.obj).forEach(field =>{
      field.addEventListener('change', this.onChangeValue.bind(this, field.dataset.prop))
    })
    // Pour affecter les tags grâce à la fenêtre
    const tagsField = this.field('tags')
    tagsField.addEventListener('focus', ev => {Tag.setCurrentTagField(tagsField)})
  }

  /**
   * Les MÉTHODES D'ÉVÈNEMENT
   */

  onChangeTime(prop){
    this.field(prop).value = TimeCalc.treate(NullIfEmpty(this.field(prop).value))
    return true
  }

  createOtherElement(ev){
    const after = ev.metaKey == true
    this.parent.createElement(this.obj, after)
  }
  onWantToDelete(ev){
    if ( !ev.metaKey &&  !confirm("Veux-tu vraiment détruire cet élément ? (quand tu es sûr de toi tu peux cliquer ce bouton en tenant la touche Cmd appuyée.)")) {
      return
    }
    this.parent.removeElement(this)
  }

  /**
   * À la création de l'élément, on peut calculer son temps s'il
   * n'est pas défini, à partir du temps de la scène d'avant et d'après
   */
  setLogicTime(){
    if ( this.time ) return ;
    this.data.time = TimeCalc.s2h(this.getTimeFromArountElements())
    this.setPropValue('time', this.data.time)
  }

  getTimeFromArountElements(){
    let prevElt, nextElt; 
    if ( this.obj.previousSibling ) {
      prevElt = MetaSTT.current.getElement(this.obj.previousSibling.dataset.id)
    }
    if ( this.obj.nextSibling) {
      nextElt = MetaSTT.current.getElement(this.obj.nextSibling.dataset.id)
    }
    // console.info("prev", prevElt)
    // console.info("next", nextElt)
    if ( nextElt && prevElt ){
      // S'il y a un élément avant et un après
      if ( nextElt.time == prevElt.time ) {
        /**
         * <= Les deux éléments autour ont le même temps
         * => Le nouvel élément a le même temps
         */
        return nextElt.realTime
      } else if (prevElt.time && prevElt.duree) {
        /**
         * <= L'élément d'avant définit un temps et une durée
         * => On met le nouvel élément au bout de cet élément
         */
        return prevElt.realTime + prevElt.realDuree
      } else if (this.realDuree && nextElt.time) {
        /**
         * <= L'élément nouveau définit une durée et le suivant un temps
         * => On place le nouvel élément d'une durée avant
         */
        return nextElt.realTime - this.realDuree
      } else if (nextElt.time && prevElt.time ) {
        /**
         * <= Les deux éléments autour définissent leur temps (mais
         *    pas leur durée)
         * => On place le nouvel élément entre les deux
         */
        return prevElt.realTime + (nextElt.realTime - prevElt.realTime) / 2 
      } else {
        return prevElt.realTime || nextElt.realTime
      }
    } else if ( nextElt && nextElt.time ) {
      return nextElt.realTime + 2
    } else if (prevElt && prevElt.time > 0) {
      return prevElt.realTime + prevElt.realDuree + 10 
    } else if ( prevElt ) {
      return 0
    }
  }

  /**
   * Retourn le champ d'édition de la propriété fournie.
   * 
   * @param {String} prop Propriété dont il faut retourner le champ d'édition
   * 
   * @return {DomElement} Le champ d'édition de la propriété +prop+
   */
  field(prop){return DGet(`.elt-${prop}`, this.obj) }


  get btnAdd(){return this._btnadd || (this._btnadd = DGet('button.btn-add', this.obj))}
  get btnDel(){return this._btndel || (this._btndel = DGet('button.btn-del', this.obj))}

}

window.EditingSTTElement = EditingSTTElement;
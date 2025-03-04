'use strict';


class EditingSTT extends MetaSTT {

  static get current(){
    return this._current || (this._current = new EditingSTT(MetaSTT.current) )
  }

  static prepare(){
    // On peuple le menu des couleurs de l'élément par défaut
    Color.buildColorMenus(DGet('div.sttediting-element select.elt-color', this.listing))
    // On clone toujours la première ligne
    EditingSTTElement.CLONE_ELEMENT = DGet('div.sttediting-element', this.listing).cloneNode(true);
    this.listing.style.height = `${this.calcListingHeight()}px`
  }

  static calcListingHeight(){
    const headerHeight = DGet('div.stt-header', this.obj).offsetHeight
    return window.innerHeight - (
      UI.headerHeight + UI.footerHeight + headerHeight + 60
    )
  }

  // ======== I N S T A N C E ==========


  constructor(metaStt){
    super()
    this.metaStt  = metaStt
    this.built    = false
    this.prepared = false
    this._elements  = null
  }

  get id(){'Editing'}

  prepare(){
    this.constructor.prepare()
    this.prepared = true
    this.built    = false
  }

  build(){
    this.constructor.eraseListing()
    var index = 0;
    this.sortedElements.forEach(elt => {
      elt.index = index ++;
      elt.build()
      this.constructor.listing.appendChild(elt.obj)
    })
    this.built = true
  }

  saveAndContinue(callback){
    this.saving = true
    const newElements = this.getDataElements()
    if ( newElements === false ) { // Une erreur dans les données
      return false
    }
    this.metaStt.data.elements = newElements
    this.metaStt.save(this.afterSave.bind(this, callback))
  }
  afterSave(callback){
    this.saving = false
    console.info("callback", callback)
    this.metaStt.resetAll()
    callback && callback()
  }

  /**
   * Fonction appelée quand on clique sur le bouton "+" au bout d'une ligne d'éléments
   */
  createElement(refElement, after = false){
    const newElt = new EditingSTTElement({id: null}, this)
    newElt.build()
    if ( refElement ) {
      const beforeElement = after ? refElement.nextSibling : refElement ;
      this.constructor.listing.insertBefore(newElt.obj, beforeElement)
      newElt.setLogicTime()
      newElt.focus('time')
    } else {
      this.constructor.listing.appendChild(newElt.obj)
    }
    super.addElement(newElt)
    this.refresh()
    this.setModified()
  }

  removeElement(elt){
    console.log("Suppression de l'élément d'index %s dans", elt.index, this.elements)
    this.elements.splice(elt.index, 1)
    console.info("Nouvelle liste d'objets", this.elements)
    elt.obj.remove()
    this.refresh()
    this.setModified()
  }

  refresh(){
    this.updateIndexElements()
    this.tensionLine.refresh()
  }

  updateIndexElements(){
    for(var i = 0, len = this.elements.length; i < len; ++i) { 
      this.elements[i].index = i 
    }
  }

  /**
   * @return La liste classée des éléments de la structure
   */
  get sortedElements(){
    return this.elements.sort(this.sortElement.bind(this))
  }
  sortElement(a, b){return (a.realTime < b.realTime) ? -1 : 0}

  get elements(){return this._elements || (this._elements = this.defineElements())}
  defineElements(){
    return this.metaStt.elements.map(elt => {
      return new EditingSTTElement(elt.data, this)
    })
  }
  // Pour redonner la liste des éléments à la métastructure
  // set elements(elts){this.metaStt.elements = elts}

  /**
   * Fonction qui boucle dans le listing pour récupérer tous les éléments
   * À QUOI ÇA SERT ENCORE ?
   * 
   * La méthode actualise aussi la propriété elements
   * @return {Array} La liste des données des éléments
   */
  getDataElements(){
    // console.info("-> getDataElements")
    try {
      // return this.elements.map(elt => {return elt.getData()})
      this.data_elements = []; // ce qui sera retourné
      var index = 0;
      this.elements.forEach(elt => {
        const data = elt.getData()
        if ( data === false ) { raise(" merci de la corriger") }
        this.data_elements.push(data)
      })
      return this.data_elements
    } catch(err) {
      Flash.error("Une erreur est survenue :" + err.message)
      console.error(err)
      return false
    }
  }

}

window.EditingSTT = EditingSTT;
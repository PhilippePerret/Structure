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
  }

  prepare(){
    this.constructor.prepare()
    this.prepared = true;
  }

  build(){
    console.info("Construire la structure VERTICALE avec les éléments", this.elements)
    var index = 0;
    this.sortedElements.forEach(belt => {
      belt.index = index ++;
      belt.build()
      this.constructor.listing.appendChild(belt.obj)
    })
    this.built = true
  }


  /**
   * Fonction appelée quand on clique sur le bouton "+" au bout d'une ligne d'éléments
   */
  addElement(refElement, after = false){
    const newElt = new EditingSTTElement({}, this) // TODO Est-ce qu'il ne faut pas plutôt faire STTElement ?
    newElt.build()
    if ( refElement ) {
      const beforeElement = after ? refElement.nextSibling : refElement ;
      this.listing.insertBefore(newElt.obj, beforeElement)
      newElt.setLogicTime()
      newElt.focus('time')
    } else {
      this.listing.appendChild(newElt.obj)
    }
  }

  removeElement(elt){
    console.log("Suppression de l'élément d'index %s dans", elt.index, this.elements)
    this.elements.splice(elt.index, 1)
    console.info("Nouvelle liste d'objets", this.elements)
    elt.obj.remove()
    this.updateIndexElements()
  }

  updateIndexElements(){
    for(var i = 0, len = this.belements.length; i < len; ++i) { this.belements[i].index = i }
  }

  /**
   * @return La liste classée des éléments de la structure
   */
  get sortedElements(){
    return this.belements.sort(this.sortElement.bind(this))
  }
  sortElement(a, b){return (a.realTime < b.realTime) ? -1 : 0}

  get elements(){return this.metaStt.elements}
  get belements(){
    return this._belements || (this._belements = this.elements.map(elt => {return new EditingSTTElement(elt, this)}));
  }

  /**
   * Fonction qui boucle dans le listing pour récupérer tous les éléments
   * 
   * La méthode actualise aussi la propriété elements
   * @return {Array} La liste des données des éléments
   */
  getDataElements(){
    // console.info("-> getDataElements")
    try {
      // return this.elements.map(elt => {return elt.getData()})
      this.elements = [];
      this.data_elements = []; // ce qui sera retourné
      var index = 0;
      DGetAll('div.stt-element', this.listing).forEach(divElt => {
        const newElt  = new ListElement()
        newElt.obj    = divElt // ce qui permettra de tout récupérer
        newElt.getData()
        newElt.index  = index ++;
        this.elements.push(newElt)
        this.data_elements.push(newElt.data)
      })
      // console.info("<- getDataElements", this.elements)
      return this.data_elements
    } catch(err) {
      Flash.error("Une erreur est survenue :" + err.message)
      console.error(err)
      return false
    }
  }

}

window.EditingSTT = EditingSTT;
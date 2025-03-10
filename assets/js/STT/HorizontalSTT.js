'use strict';


class HorizontalSTT extends MetaSTT {

  static get current(){
    return this._current || (this._current = new HorizontalSTT(MetaSTT.current) )
  }

  static prepare(){
    this.listing.innerHTML = ""
    this.prepared = true
  }

  /**
   * Fonction appelée par le formulaire autonome pour créer un nouvel
   * élément dans la structure horizontale
   */
  static createElement(data){
    const newElt = new HorizontalSTTElement(data, MetaSTT.current.dispositions.Horizontal)
    MetaSTT.current.addElement(newElt)
    newElt.build()
  }

  static onDoubleClickOnListing(ev){
    const click = new MouseClick(ev)
    console.info("Je dois apprendre à gérer le double click sur le listing horizontal (création d'un nouvel élément).", click, click.time, click.duree)
    FormElement.reset()
    FormElement.show(click)
  }

  static observe(){
    this.obj.addEventListener('dblclick', this.onDoubleClickOnListing.bind(this))
  }

  // ======== I N S T A N C E ==========


  constructor(metaStt){
    super()
    this.metaStt = metaStt
    this.built    = false
    this.prepared = false
  }

  get id(){'Horizontal'}

  prepare(){
    this.constructor.prepare()
    this.prepared   = true
    this.built      = false
    this._elements  = null
  }
  
  /**
   * Construction de cette structure.
   * 
   * Rappel : le `belements' sont les éléments (de la métastructure) 
   * mais adaptés à cette disposition.
   */
  build(){
    // console.info("Construire la structure horizontale avec les éléments", this.elements)
    this.elements.forEach(element => { element.build() })
    
    this.built = true
  }

  get elements(){return this._elements || (this._elements = this.defineElements())}
  defineElements(){
    return this.metaStt.elements.map(elt => {
      return new HorizontalSTTElement(elt.data, this)
    })
  }
  // Pour redonner la liste des éléments à la métastructure
  // set elements(elts){this.metaStt.elements = elts}
  
}

window.HorizontalSTT = HorizontalSTT;
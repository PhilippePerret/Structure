'use strict';


class EditingSTT extends MetaSTT {

  static get current(){
    return this._current || (this._current = new EditingSTT(MetaSTT.current) )
  }

  static prepare(){
    // On peuple le menu des couleurs de l'élément par défaut
    Color.buildColorMenus(DGet('div.sttediting-element select.elt-color', this.listing))
    // On clone toujours la première ligne
    this.CLONE_ELEMENT = DGet('div.sttediting-element', this.listing).cloneNode(true);
    this.listing.style.height = `${this.calcListingHeight()}px`
  }
  static calcListingHeight(){
    const headerHeight = DGet('div.stt-header', this.obj).offsetHeight
    return window.innerHeight - (
      UI.headerHeight + UI.footerHeight + headerHeight + 60
    )
  }

  // ======== I N S T A N C E ==========


  constructor(data){
    super(data)
  }

  prepare(){
    this.constructor.prepare()
    this.prepared = true;
  }

  build(){
    console.info("Construire la structure VERTICALE avec les éléments", this.elements)
  }
}

window.EditingSTT = EditingSTT;
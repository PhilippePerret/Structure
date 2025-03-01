'use strict';


class HorizontalSTT extends MetaSTT {

  static get current(){
    return this._current || (this._current = new HorizontalSTT(MetaSTT.current) )
  }

  // ======== I N S T A N C E ==========


  constructor(metaStt){
    super()
    this.metaStt = metaStt
    this.built = false
  }

  /**
   * Construction de cette structure.
   * 
   * Rappel : le `belements' sont les éléments (de la métastructure) 
   * mais adaptés à cette disposition.
   */
  build(){
    console.info("Construire la structure horizontale avec les éléments", this.elements)
    this.belements.forEach(belement => { belement.build() })
    
    this.built = true
  }

  get elements(){return this.metaStt.elements}
  get belements(){
    return this._belements || (this._belements = this.elements.map(elt => {return new HorizontalSTTElement(elt, this)}));
  }
  
}

window.HorizontalSTT = HorizontalSTT;
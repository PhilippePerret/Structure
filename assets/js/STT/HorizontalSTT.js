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

  build(){
    console.info("Construire la structure horizontale avec les éléments", this.elements)
    this.built = true
  }

  get elements(){return this.metaStt.elements}
  
}

window.HorizontalSTT = HorizontalSTT;
'use strict';


class HorizontalSTT extends MetaSTT {

  static get current(){
    return this._current || (this._current = new HorizontalSTT(MetaSTT.current) )
  }

  // ======== I N S T A N C E ==========


  constructor(data){
    super(data)
  }

  build(){
    console.info("Construire la structure horizontale avec les éléments", this.elements)
  }
}

window.HorizontalSTT = HorizontalSTT;
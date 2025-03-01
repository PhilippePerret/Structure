'use strict';


class VerticalSTT extends MetaSTT {

  static get current(){
    return this._current || (this._current = new VerticalSTT(MetaSTT.current) )
  }

  // ======== I N S T A N C E ==========

  constructor(metaStt){
    super()
    this.metaStt = metaStt;
  }

  build(){
    console.info("Construire la structure VERTICALE avec les éléments", this.elements)
  }

}

window.VerticalSTT = VerticalSTT;
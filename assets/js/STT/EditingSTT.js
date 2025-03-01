'use strict';


class EditingSTT extends MetaSTT {

  static get current(){
    return this._current || (this._current = new EditingSTT(MetaSTT.current) )
  }

  // ======== I N S T A N C E ==========


  constructor(data){
    super(data)
  }

  build(){
    console.info("Construire la structure VERTICALE avec les éléments", this.elements)
  }
}

window.EditingSTT = EditingSTT;
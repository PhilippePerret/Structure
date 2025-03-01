'use strict';

class EditingSTTElement extends MetaSTTElement {

  // ======== I N S T A N C E ==========

  constructor(data){
    super(data)
  }

  build(){
    console.info("Construire la structure horizontale avec les éléments", this.elements)
    this.built = true
  }

  get elements(){return this.metaStt.elements}

}

window.EditingSTTElement = EditingSTTElement;
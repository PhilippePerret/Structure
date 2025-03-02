'use strict';

const DEFAULT_VALUES = {
    id: ""
  , time: ""
  , duree: "2:00"
  , type: "scene"
  , ideality: "none"
  , pitch: ""
  , color: "normal"
  , tension: ""
}
const ELEMENT_PROPERTIES = Object.keys(DEFAULT_VALUES)

class EditingSTTElement extends MetaSTTElement {

  // ======== I N S T A N C E ==========

  constructor(data){
    super(data)
  }

  build(){


    this.built = true
  }

  get elements(){return this.metaStt.elements}

}

window.EditingSTTElement = EditingSTTElement;
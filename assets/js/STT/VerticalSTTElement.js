'use strict';

class VerticalSTTElement extends MetaSTTElement {

  static get container(){ return VerticalSTT.current }

  // ======== I N S T A N C E ==========

  constructor(data){
    super(data)
  }

  /**
   * Construction de l'élément dans la structure vertical
   */
  build(){
    const o = DCreate('DIV', {class: "stt-element vertical"})
    this.obj = o
    this.constructor.container.append(this)
  }

}

window.VerticalSTTElement = VerticalSTTElement;
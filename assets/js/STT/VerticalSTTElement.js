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
    const eHeight = `${this.dureeToHeigh()}px`
    const o = DCreate('DIV', {
        class: "stt-element vertical"
      , text: this.pitch
      , style: `height: ${eHeight};`
    })
    o.style.height = eHeight
    const leftBand = DCreate('DIV', {
        class:'left-band'
      , style: `height:${eHeight};background-color:${this.bgColor};`
    })
    o.appendChild(leftBand)
    this.obj = o
    this.built = true
  }

  dureeToHeigh(){
    return parseInt(TimeCalc.s2p(this.realDuree || 120) * 0.8)
  }

  get elements(){return this.metaStt.elements}

}

window.VerticalSTTElement = VerticalSTTElement;
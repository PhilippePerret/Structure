'use strict';


class VerticalSTT extends MetaSTT {

  static get current(){
    return this._current || (this._current = new VerticalSTT(MetaSTT.current) )
  }

  static prepare(){
    this.listing.innerHTML = ""
  }

  // ======== I N S T A N C E ==========

  constructor(metaStt){
    super()
    this.metaStt = metaStt;
    this.built    = false
    this.prepared = false
    this._elements  = null
  }

  get id(){'Vertical'}

  prepare(){
    this.constructor.prepare()
    this.prepared = true
    this.built    = false
  }

  build(){
    this.elements.forEach(elt => {
      elt.build()
      this.constructor.listing.appendChild(elt.obj)
    })
    this.built = true
  }


  get elements(){return this._elements || (this._elements = this.defineElements())}
  defineElements(){
    return this.metaStt.elements.map(elt => {
      return new VerticalSTTElement(elt.data, this)
    })
  }

}

window.VerticalSTT = VerticalSTT;
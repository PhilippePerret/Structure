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
  }

  prepare(){
    this.constructor.prepare()
    this.prepared = true
  }

  build(){
    console.info("Construire la structure VERTICALE avec les éléments", this.elements)
    this.built = true
  }

}

window.VerticalSTT = VerticalSTT;
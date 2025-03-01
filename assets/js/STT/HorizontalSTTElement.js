'use strict';

class HorizontalSTTElement extends MetaSTTElement {


  // ======== I N S T A N C E ==========

  constructor(metaElt, parent){
    super(metaElt.data)
    this.metaElt = metaElt;
    this.parent  = parent ; // HorizontalSTT
    console.info("parent", parent)
  }

  get domId(){return this._domid || (this._domid = `${this.parent.constructor.classname}-elt-${this.id}`)}

  build(){
    const div = DCreate(this.TYPE, {id: this.domId})
    this.obj = div
    div.appendChild(DCreate('SPAN', {text: this.pitch}))
    this.stype && (this.setClass(this.style));
    console.log("Objet créé : ", div)
    // On l'ajoute au listing
    this.parent.append(this)
    // On le dimensionne et on le positionne
    this.dimEtPositionne()
    this.observe()

  }

  dimEtPositionne(){

    // Pour définir la marque sous le pitch de l'élément scène, pour
    // régler sa longueur et sa couleur
    if ( this.type == 'scene' ) {
      this.obj.style.setProperty('--background', this.safeBackgroundColor);
      this.obj.style.setProperty('--width', `${UI.horlogeToPixels(this.duree)}px`)
    }

    this.obj.style.left = `${UI.horlogeToPixels(this.data.time)}px`
    this.type == 'seq' && (this.obj.style.width = `${UI.horlogeToPixels(this.duree)}px`);
    this.top   && (this.obj.style.top = `${this.top}px`);
  }

  observe(){
    this.listen(this.obj, 'add', 'dblclick', this.editBinding)
  }
  unobserve(){
    this.listen(this.obj, 'remove', 'dblclick', this.editBinding)
  }
  listen(obj, ope, eventType, method){
    obj[`${ope}EventListener`](eventType, method)
  }


}

window.HorizontalSTTElement = HorizontalSTTElement;
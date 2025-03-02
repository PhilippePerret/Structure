'use strict';

class HorizontalSTTElement extends MetaSTTElement {


  // ======== I N S T A N C E ==========

  constructor(data, stt){
    super(data)
    this.parent  = stt ; // HorizontalSTT
  }

  get domId(){return this._domid || (this._domid = `${this.parent.constructor.classname}-elt-${this.id}`)}

  build(){
    const div = DCreate(this.TYPE, {id: this.domId})
    this.obj = div
    div.appendChild(DCreate('SPAN', {text: this.pitch}))
    this.stype && (this.setClass(this.style));
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
      this.obj.style.setProperty('--background', this.bgColor);
      this.obj.style.setProperty('--width', `${TimeCalc.horlogeToPixels(this.duree)}px`)
    }

    this.obj.style.left = `${TimeCalc.horlogeToPixels(this.data.time)}px`
    this.type == 'seq' && (this.obj.style.width = `${TimeCalc.horlogeToPixels(this.duree)}px`);
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
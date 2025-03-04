'use strict';

class HorizontalSTTElement extends MetaSTTElement {


  // ======== I N S T A N C E ==========

  constructor(data, stt){
    super(data)
    this.parent  = stt ; // HorizontalSTT
    this.editBinding = this.edit.bind(this)
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

  /**
   * Fonction pour éditer l'élément (seulement utile pour les
   * structure verticales et horizontales). l'édition se fait
   * dans le formulaire flottant
   */
  edit(ev){
    // Flash.error("Pour le moment, l'édition de cette manière ne fonctionne pas.utiliser la version “editing” de la structure.")
    ev.stopPropagation()
    // return false
    const mclick = new MouseClick(ev)
    FormElement.openWith(this, mclick)
    FormElement.setData(this)
    return false
  }

  update(newData){
    console.log("-> update de l'horizontal")
    // super.update(newData)
    Object.assign(this.data, newData)
    setTimeout(this.rebuild.bind(this), 200)
  }

  rebuild(){
    console.log("-> rebuild de l'horizontal")
    this.reset()
    this.obj.remove()
    this.build()
  }

  dimEtPositionne(){

    // Pour définir la marque sous le pitch de l'élément scène, pour
    // régler sa longueur et sa couleur
    if ( this.type == 'scene' ) {
      this.obj.style.setProperty('--background', this.bgColor);
      this.obj.style.setProperty('--width', this.width)
    }

    this.obj.style.left = this.left;
    this.type == 'seq' && (this.obj.style.width = this.width);
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
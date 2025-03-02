'use strict';
/**
 * Gestion de l'édition d'un élément de structure
 */
class SttElement {

  /**
   * Foncton appelée par le bouton "Enregistrer" du formulaire
   * d'édition de l'élément
   */
  static createOrUpdate(){
    const dataElement = FormElement.getData()
    if ( FormElement.areValidData(dataElement) ) {
      if ( dataElement.id ) {
        this.updateElement(dataElement)
      } else /* création */ {
        this.createElement(dataElement)
      }
    } else /* Données invalides */ {
      return false
    }
  }

  static updateElement(data){
    const element = Structure.current.getElement(data.id)
    console.info("element", element)
    element.update(data)
  }
  static createElement(data){
    data.id = this.getNewId()
    const newElement = new SttElement(data)
    Structure.current.addElement(newElement)
    newElement.build()
  }

  // --- INSTANCE ---

  constructor(data){
    this.data = data
    this.editBinding = this.edit.bind(this)
  }

  setClass(dClass) {
    dClass = dClass || this.data.stype;
    var css; 
    if ( 'string' == typeof dClass ) {
      css = dClass
    } else {
      css = dClass.join(" ")
    }
    this.obj.className = css
  }
  setColor(colorId){
    const {bg,fg} = this.colorData(colorId)
    this.obj.style.backgroundColor = bg;
    this.obj.style.color = fg;
  }
}

window.SttElement = SttElement;

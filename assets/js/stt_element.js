'use strict';


/**
 * Gestion de l'édition d'un élément de structure
 */
class SttElement {

  /**
   * Fonction qui calcule et fournit un identifiant unique pour le
   * type +type+ (scene ou seq pour le moment)
   */
  static getNewId(type){
    const partDate = String(new Date().getTime()).replace("\.", "")
    const partAlea = String(parseInt(Math.random() * 100))
    const chunk4 = (partDate+partAlea).match(/.{1,4}/g)
    return type + "-" + chunk4.join("-")
  }

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
    data.id = this.getNewId(data.type)
    const newElement = new SttElement(data)
    Structure.current.addElement(newElement)
    newElement.build()
  }

  // --- INSTANCE ---

  constructor(data){
    this.data = data
    this.editBinding = this.edit.bind(this)
  }

  /**
   * Toutes les propriétés de l'élément structurel, que ce soit une
   * scène ou une séquence (ou autre à l'avenir)
   */
  get id(){return this.data.id }
  get pitch(){return this.data.pitch || this.data.text}
  get ideality(){return this.data.ideality}
  get type(){return this.data.type}
  get time(){return this.data.time}
  get duree(){return this.data.duree}
  get tension(){return this.data.tension}
  get color(){return this.data.color}

  get realTime(){return this._realtime || (this._realtime = TimeCalc.h2s(this.time))}
  get realDuree(){return this._realduree || (this._realduree = TimeCalc.h2s(this.duree))}

  edit(ev){
    FormElement.setData(this)
  }

  update(newData){
    this.reset()
    this.data = newData
    this.unobserve()
    this.obj.remove()
    this.build()
  }

  reset(){
    delete this._realtime
    delete this._realduree
  }

  /**
   * Construction de l'élément (dans toutes les représentations de la
   * structure)
   */
  build(){
    const data = this.data
    const eltId = `elt-${this.id}`
    const div = DCreate(data.type.toUpperCase(), {id:eltId})
    this.obj = div
    div.appendChild(DCreate('SPAN', {text: this.pitch}))
    div.setAttribute("time", this.time);
    div.setAttribute("duree", this.duree);
    data.stype && (this.setClass(data.style));

    // Pour définir la marque sous le pitch de l'élément scène, pour
    // régler sa longueur et sa couleur
    if ( this.type == 'scene' ) {
      this.obj.style.setProperty('--background', this.safeBackgroundColor);
      this.obj.style.setProperty('--width', `${UI.horlogeToPixels(this.duree)}px`)
    }

    Structure.blocElements.appendChild(this.obj)

    this.positionne()
    this.observe()
  }
  buildOnHorisontalStructure(){

  }
  buildOnVerticalStructure(){

  }
  buildOnEditingStructure(){

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

  positionne(){
    this.obj.style.left = `${UI.horlogeToPixels(this.data.time || "0:00")}px`
    this.duree && this.type == 'seq' && (this.obj.style.width = `${UI.horlogeToPixels(this.duree)}px`);
    this.top   && (this.obj.style.top = `${this.top}px`);
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

  /**
   * Propriété : couleur qui ne sera jamais blanche
   */
  get safeBackgroundColor(){
    let bg = this.colorData().bg;
    if ( !bg || bg == "white" || bg == "#FFFFFF" ) {bg = "black"}
    return bg
  }

  colorData(colorId){
    colorId = colorId || this.color || 'normal'
    return COLOR_TABLE[colorId] || COLOR_TABLE['normal'] 
  }
}


window.SttElement = SttElement;

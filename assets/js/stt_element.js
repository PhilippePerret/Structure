'use strict';


/**
 * Gestion de l'édition d'un élément de structure
 */
class SttElement {

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
    const dataElement = ElementForm.getData()
    if ( ElementForm.areValidData(dataElement) ) {
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
    console.info("Je dois apprendre à créer l'élément avec", data)
    const newElement = new SttElement(data)
    Structure.current.addElement(newElement)
    newElement.build()
  }

  // --- INSTANCE ---

  constructor(data){
    this.data = data
    this.editBinding = this.edit.bind(this)
  }

  get id(){return this.data.id }
  get pitch(){return this.data.pitch || this.data.text}
  get type(){return this.data.type}
  get time(){return this.data.time || "0:00"}
  get duree(){return this.data.duree || "2:00"}
  get tension(){return this.data.tension || ""}
  get color(){return this.data.color || ""}


  edit(ev){
    ElementForm.setData(this)
  }

  update(newData){
    this.data = newData
    this.unobserve()
    this.obj.remove()
    this.build()
  }

  build(){
    const data = this.data || this.getData() // à supprimer, on doit maintenant toujours envoyer les données à l'instanciation
    const eltId = `elt-${this.id}`
    const div = DCreate(data.type.toUpperCase(), {id:eltId})
    this.obj = div
    div.appendChild(DCreate('SPAN', {text: this.pitch}))
    div.setAttribute("time", this.time);
    div.setAttribute("duree", this.duree);
    data.stype && (this.setClass(data.style));
    Structure.cadre.appendChild(this.obj)

    this.positionne()
    this.observe()
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
    this.obj.style.left = `${STT.horlogeToPixels(this.data.time || "0:00")}px`
    this.duree && this.type == 'seq' && (this.obj.style.width = `${STT.horlogeToPixels(this.duree)}px`);
    this.top   && (this.obj.style.top = `${this.top}px`);
    this.color && this.setColor();
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
  setColor(dColor){
    dColor = dColor || this.data.color
    const [bg,fg] = dColor.split(/[-,;\.]/);
    this.obj.style.backgroundColor = bg;
    this.obj.style.color = fg;
  }
}


window.SttElement = SttElement;

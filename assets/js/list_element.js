'use strict';

const ELEMENT_PROPERTIES = ['id', 'time','duree','type','ideality','pitch','color','tension'];
const DEFAULT_VALUES = {
  id: "", time: "", duree: "2:00", type: "scene", ideality: "none", pitch: "", color: "normal", tension: ""
}

/**
 * Pour la gestion de la "feuille de scènes", le panneau qui présente
 * toutes les scènes et toutes les séquences sous forme de listing 
 * les une au-dessus des autres.
 * 
 * Permet de créer très rapidement la structure.
 * 
 * La classe permet de gérer la liste comme un élément.
 * Les instances sont les éléments distincts.
 * 
 */
class ListElement {

  static prepare(){
    // Le menu couleur
    FormElement.buildMenuColor(DGet('div.list-element select.elt-color'))
    // On clone toujours la première ligne
    this.CLONE_ELEMENT = DGet('div.list-element', this.obj).cloneNode(true);
  }

  // Pour afficher ou masquer la liste des éléments
  static toggle(){ this[this.obj.dataset.actif == 'false' ? 'show':'hide']()}
  static show(){
    this.built || this.build(Structure.current)
    this.obj.classList.remove('hidden');
    this.obj.dataset.actif = 'true'
    FormElement.hide()
  }
  static hide(){
    this.obj.classList.add('hidden');this.obj.dataset.actif = 'false';
    FormElement.show()
  }

  /**
   * Fonction appelée par le bouton "Construire" pour reconstruire la 
   * structure à partir des éléments du listing.
   * Si cette fonction est appelée directement, les nouvelles données
   * sont transmises à la structure courante mais pas enregistrées
   */
  static buildStructure(dataElements){
    if ( ! dataElements ) {
      dataElements = this.getDataElements()
      if ( !dataElements ) return ; // en cas d'erreur (mauvaise donnée par exemple)
      // console.log("éléments ramassés", dataElements)
      Structure.current.resetWithElements(dataElements)
    }
    Structure.eraseElements()
    Structure.current.build()
  }

  /**
   * Fonction pour sauver les éléments courants
   */
  static save(){
    console.info("-> ListElement.save()")
    try {
      if ( ! Structure.current.path ) raise("Il faut sauver une première fois la nouvelle structure.");
      console.info("Structure.current", Structure.current)
      let dataElements = this.getDataElements()
      if ( ! dataElements ) return ; // en cas d'erreur (mauvaise donnée par exemple)
      Structure.current.resetWithElements(dataElements)
      Structure.current.save()
      return buildStructure(dataElements)
    } catch (err) {
      Flash.error(err.message)
      return false
    }
  }

  /**
   * Fonction pour reconstruire la liste à partir des éléments 
   * courants de la structure
   */
  static reset(){
    this.build(Structure.current)
    // Dans le cas où la structure ne contiendrait aucun élément, on
    // en crée un, virtuel
    if ( Structure.current.elements.length == 0 ){
      console.info("Ajout d'un élément.")
      this.addElement()
    } else {
      console.info("Nombre d'éléments dans la structure", Structure.current.elements.length)
    }
  }

  /**
   * Fonction qui boucle dans le listing pour récupérer tous les éléments
   */
  static getDataElements(){
    try {
      return this.elements.map(elt => {return elt.getData()})
    } catch(err) {
      return false
    }
  }

  /**
   * Fonction pour construire le panneau
   */
  static build(structure){
    this.listing.innerHTML = ""

    var index = 0;
    this.elements = [];
    structure.elements
    .sort(this.sortElement.bind(this))
    .forEach(elt => {
      const list_elt = new ListElement(elt.data)
      list_elt.index = index ++;
      list_elt.build()
      this.listing.appendChild(list_elt.obj)
      this.elements.push(list_elt)
    })
    this.built = true
  }
  static sortElement(a, b){
    return (a.realTime < b.realTime) ? -1 : 0 ;
  }
  /**
   * Fonction appelée quand on clique sur le bouton "+" au bout d'une ligne d'éléments
   */
  static addElement(refElement, after = false){
    const newElt = new ListElement()
    newElt.build()
    if ( refElement ) {
      const beforeElement = after ? refElement.nextSibling : refElement ;
      this.listing.insertBefore(newElt.obj, beforeElement)
      newElt.setLogicTime()
      newElt.focus('time')
    } else {
      this.listing.appendChild(newElt.obj)
    }
  }

  static removeElement(elt){
    console.log("Suppression de l'élément d'index %s dans", elt.index, this.elements)
    this.elements.splice(elt.index, 1)
    console.info("Nouvelle liste d'objets", this.elements)
    elt.obj.remove()
    this.updateIndexElements()
  }

  static updateIndexElements(){
    for(var i = 0, len = this.elements.length; i < len; ++i) { this.elements[i].index = i }
  }


  static get obj(){return this._obj || (this._obj = DGet('div#listing-elements'))}

  static get listing(){return this._listing || (this._listing = DGet('div#listing-elements-listing'))}

  // === I N S T A N C E ====

  constructor(data){
    this.data = data || {}
  }

  getData(){
    const data = {}
    ELEMENT_PROPERTIES.forEach(prop => {
      Object.assign(data, {[prop]: DGet(`.elt-${prop}`, this.obj).value})
    })
    // Transformation de certaines valeurs
    if ( !data.id ) data.id = SttElement.getNewId(data.type)
    data.time   = this.setPropValue('time',  TimeCalc.treate(data.time, 'FULL'))
    data.duree  = this.setPropValue('duree', TimeCalc.treate(data.duree, false))
    // On vérifie la validité des données
    if ( false === formElement.areValidData(data) ) return false ;
    return data
  }
  setPropValue(prop, value){
    this.field(prop).value = value
    return value // chainage
  }

  focus(prop){
    const field = this.field(prop)
    field.focus()
    field.select()
  }

  /**
   * À la création de l'élément, on peut calculer son temps s'il
   * n'est pas défini, à partir du temps de la scène d'avant et d'après
   */
  setLogicTime(){
    if ( this.time ) return ;
    this.data.time = TimeCalc.s2h(this.getTimeFromArountElements())
    this.setPropValue('time', this.data.time)
  }
  getTimeFromArountElements(){
    let prevElt, nextElt; 
    if ( this.obj.previousSibling ) {
      prevElt = Structure.current.getElement(this.obj.previousSibling.dataset.id)
    }
    if ( this.obj.nextSibling) {
      nextElt = Structure.current.getElement(this.obj.nextSibling.dataset.id)
    }
    console.info("prev", prevElt)
    console.info("next", nextElt)
    if ( nextElt && prevElt ){
      if ( nextElt.time == prevElt.time ) {
        return nextElt.realTime
      } else if (nextElt.time && nextElt.duree) {
        return nextElt.realTime + nextElt.realDuree
      } else if (this.SttElement.realDuree && nextElt && nextElt.time) {
        return nextElt.realTime - this.SttElement.realDuree
      } else if (nextElt.time && prevElt.time ) {
        return prevElt.realTime + (nextElt.realTime - prevElt.realTime) / 2 
      } else {
        return prevElt.realTime || nextElt.realTime
      }
    } else if ( nextElt && nextElt.time ) {
      return nextElt.realTime + 2
    } else if (prevElt && prevElt.time > 0) {
      return prevElt.realTime + prevElt.realDuree + 10 
    } else if ( prevElt ) {
      return 0
    }
  }

  get SttElement(){return Structure.current.getElement(this.data.id)}

  /**
   * Retourn le champ d'édition de la propriété fournie.
   * 
   * @param {String} prop Propriété dont il faut retourner le champ d'édition
   * 
   * @return {DomElement} Le champ d'édition de la propriété +prop+
   */
  field(prop){return DGet(`.elt-${prop}`, this.obj) }

  build(){
    this.obj = ListElement.CLONE_ELEMENT.cloneNode(true)
    this.obj.dataset.id = this.data.id
    ELEMENT_PROPERTIES.forEach(prop => {
      DGet(`.elt-${prop}`, this.obj).value = this.data[prop] || DEFAULT_VALUES[prop]
    })
    // On met le résumé dans la couleur choisie
    const pitch = this.field('pitch')
    if ( this.color ) {
      pitch.style.backgroundColor = this.color.bg
      pitch.style.color = this.color.fg
    }
    this.observe()
  }
  observe(){
    this.btnAdd.addEventListener('click', this.addOtherElement.bind(this))
    this.btnDel.addEventListener('click', this.onWantToDelete.bind(this))
    this.field('time').addEventListener('blur', this.onChangeTime.bind(this, 'time'))
    this.field('duree').addEventListener('blur', this.onChangeTime.bind(this, 'duree'))
  }

  onChangeTime(prop, ev){
    this.field(prop).value = TimeCalc.treate(nullIfEmpty(this.field(prop).value))
    return true
  }

  addOtherElement(ev){
    const after = ev.metaKey == true
    ListElement.addElement(this.obj, after)
  }
  onWantToDelete(ev){
    if ( !ev.metaKey &&  !confirm("Veux-tu vraiment détruire cet élément ? (quand tu es sûr de toi tu peux cliquer ce bouton en tenant la touche Cmd appuyée.)")) {
      return
    }
    ListElement.removeElement(this)
  }

  get color(){return COLOR_TABLE[this.data.color]}
  get btnAdd(){return this._btnadd || (this._btnadd = DGet('button.btn-add', this.obj))}
  get btnDel(){return this._btndel || (this._btndel = DGet('button.btn-del', this.obj))}
}

window.ListElement = ListElement;
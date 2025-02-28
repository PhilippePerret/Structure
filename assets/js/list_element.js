'use strict';

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

  // Pour afficher ou masquer la liste des éléments
  static toggle(){ this[this.obj.dataset.actif == 'false' ? 'show':'hide']()}
  static show(){
    this.built || this.build(Structure.current)
    this.obj.classList.remove('hidden');
    this.obj.dataset.actif = 'true'
  }
  static hide(){this.obj.classList.add('hidden');this.obj.dataset.actif = 'false'}

  /**
   * Fonction pour construire le panneau
   */
  static build(structure){
    this.modeleElement = DGet('div.list-element', this.obj).cloneNode(true);
    this.listing.innerHTML = ""
    this.elements = []
    structure.elements
    .sort(this.sortElement.bind(this))
    .forEach(elt => {
      const list_elt = new ListElement(elt.data)
      list_elt.build()
      console.log("listing:", this.listing)
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
  static addElement(beforeElement, ev){

  }

  static get obj(){return this._obj || (this._obj = DGet('div#listing-elements'))}

  static get listing(){return this._listing || (this._listing = DGet('div#listing-elements-listing'))}

  // === I N S T A N C E ====

  constructor(data){
    this.data = data
  }

  build(){
    this.obj = ListElement.modeleElement.cloneNode(true)
    this.obj.dataset.id = this.data.id
    ;['time','duree','type','ideality','pitch','color','tension'].forEach(prop => {
      console.log("%s=", prop, this.data[prop])
      DGet(`.elt-${prop}`, this.obj).value = this.data[prop]
    })
    this.observe()
  }
  observe(){

  }

}

window.ListElement = ListElement;
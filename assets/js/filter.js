'use strict';
/**
 * Gestion des filtres d'éléments en fonction des paramètres choisis.
 * 
 * Chaque type de structure a son propre filtre (on peut demander à 
 * ce qu'ils soient synchronisés)
 */

class EFilter {

  static get PANEL_CLONE(){return DGet('div.filter-form-container')}

  static openFilter(name){
    const filter = new EFilter(MetaSTT.current)
    filter.show()
  }

  // ========= I N S T A N C E   E F I L T E R ==========

  constructor(stt){
    this.stt = stt
    console.log("stt", stt)
    this.prepare()
  }

  /**
   * Méthode principale pour appliquer le filtre à la liste qui lui
   * est associée. Appelé par le bouton "Filtrer" ou à tout 
   * changement peut-être
   */
  apply(){
    console.info("Je dois apprendre à appliquer le filtre choisi.")
    const parType = NullIfEmpty(this.typeField.value)
    const parText = NullIfEmpty(this.textField.value)
    // TODO Relever les tags cochés
  }

  show(){this.obj.classList.remove('hidden')}
  hide(){this.obj.classList.add('hidden')}

  prepare(){
    console.info("Je dois apprendre à préparer les filtres")
    this.build()
    this.prepared = true
  }
  
  build(){
    const o = this.constructor.PANEL_CLONE.cloneNode(true)
    document.body.appendChild(o)
    this.obj = o
    // Construire la boite des tags
    this.buildTagsPanel(o)

    this.observe()
    return o ; // pour _obj
  }
  buildTagsPanel(o){
    console.log("Construction des tags", this.stt.tags)
    this.stt.tags.forEach(dtag => {
      const cbtagid = `${this.stt.classname}-cb-tag-${dtag.name.replace(" ", "")}`
      const otag = DCreate('DIV', {class:'filter-tag'})
      const labtag = DCreate('LABEL', {text: dtag.name})
      labtag.setAttribute('for', cbtagid)
      const cbtag = DCreate('INPUT', {type: 'checkbox', id: cbtagid})
      cbtag.dataset.name = dtag.name
      otag.appendChild(cbtag)
      otag.appendChild(labtag)
      this.tagsField.appendChild(otag)
    })
  }

  observe(){
    this.btnFilter.addEventListener('click', this.apply.bind(this))
  }

  /**
   * Pour synchronizer les filtres
   */
  synchronize(){
    console.info("Je dois apprendre à synchroniser les filtres.")
  }

  get textField(){return DGet('input.filter-text', this.obj)}
  get typeField(){return DGet('input.filter-type', this.obj)}
  get tagsField(){return DGet('div.filter-tags', this.obj)}
  get btnFilter(){return DGet('button.btn-filter', this.obj)}

}
window.EFilter = EFilter
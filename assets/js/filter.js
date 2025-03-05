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
    // console.log("stt", stt)
    this.prepare()
  }

  /**
   * Supprimer l'application du filtre (remontre tous les éléments)
   */
  reset(){
    this.stt.elements.forEach(elt => this.divOf(elt).classList.remove('hidden'))
  }

  /**
   * Mémoriser le filtre courant
   */
  memorize(){
    console.log("Je dois apprendre à mémoriser le filtre courant.")
  }

  /**
   * Méthode principale pour appliquer le filtre à la liste qui lui
   * est associée. Appelé par le bouton "Filtrer" ou à tout 
   * changement peut-être
   */
  apply(){
    const filter = this.getFilterValue()
    filter && this.applyFilter(filter)
  }

  /**
   * Applique véritablement le filtre à la liste
   */
  applyFilter(filter){
    this.stt.elements.forEach(elt => this.showIfPassFilter(elt, filter))
  }
  /**
   * Méthode qui montre l'élément s'il remplit le filtre choisi.
   */
  showIfPassFilter(elt, filters){
    const eltObj = this.divOf(elt)
    for(var filter of filters){
      const ok = filter.call(this, elt)
      eltObj.classList[ok ? 'remove' : 'add']('hidden')
    }
  }

  divOf(elt){
    return DGet(`*[data-id="${elt.id}"]`, this.disposition)
  }

  get disposition(){return this._dispo || (this._dispo = this.stt.disposition.obj)}

  filterByText(dfilter, elt){
    switch(dfilter.condition){
      case 'all words':
        return this.textContainsAllWords(elt.pitch, dfilter.words)
      case 'one word':
      case 'sentence':
        return ` ${elt.pitch} `.match(dfilter.regExp) !== null;
    }
  }
  filterByType(type, elt){
    return elt.type == type
  }
  filterByTension(methodComp, elt){
    return elt.tension && methodComp(elt.tensionData.level)
  }
  filterByTags(methodComp, elt){
    return methodComp(elt.tagsAsMap)
  }

  /**
   * Retourne la table du filtre choisi
   * 
   * @return {Object} Une table avec les clés :text, :color, :tension, 
   * etc. et les valeurs correspondantes (mais seulement si le filtre 
   * doit être appliqué à ce paramètre.)
   */
  getFilterValue(){
    const filter  = []
    // --- Filtre par type ---
    const parType = NullIfEmpty(this.typeField.value)
    parType && filter.push(this.filterByType.bind(this, parType))
    // --- Filtre par texte ---
    const text = NullIfEmpty(this.textField.value.trim())
    if ( text ) {
      const parText = {condition: this.textCondField.value, text: text}
      switch(parText.condition){
        case 'all words':
          Object.assign(parText, {words: text.split(' ')})
          break;
        case 'one word':
          const words = " (" + text.split(' ').join("|") + ") "
          Object.assign(parText, {regExp: new RegExp(words, "i")})
          break
        case 'sentence':
          Object.assign(parText, {regExp: new RegExp(text, "i")})
          break
      }
      filter.push(this.filterByText.bind(this, parText))
    }

    // --- Filtre par Tags ---
    const allTags = []
    this.forEachTag(tag => { tag.checked && allTags.push(tag.name)})
    if ( allTags.length ) {
      const method = (cond => {
        switch(cond){
          case 'all': return this.containsAllTags.bind(this, allTags);
          case 'one': return this.containsOneTagAmong.bind(this, allTags);
          case 'none': return this.notContainsAllTags.bind(this, allTags);
          case 'no-one': return this.containsAnyAmong.bind(this, allTags);
        }
      })(this.tagCondField.value)
      filter.push(this.filterByTags.bind(this, method))
    }

    // --- Filtre par tension ---
    const tensOperand = NullIfEmpty(this.tensionOpField.value)
    const tensValue   = NullIfEmpty(this.tensionField.value)
    if ( tensOperand && tensValue ) {
      const method = (op => {
        switch(op){
          case 'sup' : return this.isSup.bind(this, tensValue);
          case 'inf' : return this.isInf.bind(this, tensValue);
          case 'sup-or-equal': return this.isSupOrEqual.bind(this, tensValue);
          case 'inf-or-equal': return this.isInfOrEqual.bind(this, tensValue);
          case 'equal': return this.isEqual.bind(this, tensValue);
          case 'diff': return this.isDiff.bind(this, tensValue);
        }
      })(tensOperand)
      filter.push(this.filterByTension.bind(this, method))
    }
    
    
    // const parColor = Array.from(this.colorField.selectedOptions).map(option => option.value);
    // parColor.length && filter.push({color: parColor})

    if (filter.length) {
      return filter
    } else {
      Flash.notice("Aucun filtre n'est à appliquer.")
    }
  }

  
  // Méthodes de condition

  isSup(ref, comp){
    console.info("ref = %s, comp = %s, res : ", ref, comp, comp > ref)
    return comp > ref 
  }
  isSupOrEqual(ref, comp){return comp >= ref}
  isInf(ref, comp){
     return comp < ref 
    }
  isInfOrEqual(ref, comp){return comp <= ref}
  isDiff(ref, comp){return comp != ref}
  isEqual(ref, comp){return comp == ref}

  containsAnyAmong(tags, comp){
    for( const tag of tags ) {
      if ( comp[tag] === true ) return false;
    }
    return true
  }
  notContainsAllTags(tags, comp){
    for(var tag of Object.keys(comp)){
      if ( !tags.includes(tag) ) return true
    }
    return false
  }
  containsOneTagAmong(tags, comp){
    for (var tag of tags ){
      if ( comp[tag] === true ) return true
    }
    return false
  }
  containsAllTags(tags, comp){
    for( const tag of tags ) {
      if ( !comp[tag] ) return false
    }
    return true
  }


  show(){this.obj.classList.remove('hidden')}
  hide(){this.obj.classList.add('hidden')}

  prepare(){
    this.build()
    this.prepared = true
  }
  
  build(){
    const o = this.constructor.PANEL_CLONE.cloneNode(true)
    document.body.appendChild(o)
    this.obj = o
    // Construire la boite des tags
    this.buildTagsPanel(o)
    // Construire le menu des couleurs
    Color.buildColorMenus(this.colorField)
    // On observe les champs et boutons qui doivent l'être
    this.observe()
    return o ; // pour _obj
  }


  buildTagsPanel(o){
    this.tags = []
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
      this.tags.push(new FilterTag(Object.assign(dtag, {obj: otag})))
    })
  }

  /**
   * Boucle la méthode method sur chaque instance Tag
   * 
   * Rappel : les instances (this.tags) sont instanciées lors de la
   * construction du filtre.
   */
  forEachTag(method){
    this.tags.forEach(tag => method.call(null, tag))
  }

  observe(){
    this.btnFilter.addEventListener('click', this.apply.bind(this))
    this.btnReset.addEventListener('click', this.reset.bind(this))
    this.btnMemo.addEventListener('click', this.memorize.bind(this))
  }

  /**
   * Pour synchronizer les filtres
   */
  synchronize(){
    console.info("Je dois apprendre à synchroniser les filtres.")
  }

  /**
   * @return true si le texte +str+ contient tous les mots +words+
   * 
   * @param {String} str Le sujet
   * @param {Array} words La liste des mots
   */
  textContainsAllWords(str, words){
    for( var word of words ){
      if ( str.indexOf(word) < 0 ) return false;
    }
    return true
  }

  get textField(){return DGet('input.filter-text', this.obj)}
  get textCondField(){return DGet('select.filter-text-condition', this.obj)}
  get typeField(){return DGet('select.filter-type', this.obj)}
  get tagsField(){return DGet('div.filter-tags', this.obj)}
  get tagCondField(){return DGet('select.filter-tags-condition', this.obj)}
  get tensionField(){return DGet('input.filter-tension', this.obj)}
  get tensionOpField(){return DGet('select.filter-tension-operand', this.obj)}
  get colorField(){return DGet('select.filter-color', this.obj)}
  get btnFilter(){return DGet('button.btn-filter', this.obj)}
  get btnReset(){return DGet('button.btn-reset', this.obj)}
  get btnMemo(){return DGet('button.btn-memo', this.obj)}

}

class FilterTag {
  constructor(data){
    this.data = data
  }
  get checked(){return this.checkbox.checked == true}
  get name(){return this.data.name}
  get checkbox(){return this._cb || (this._cb = DGet('input[type="checkbox"]', this.data.obj))}
}

window.EFilter = EFilter
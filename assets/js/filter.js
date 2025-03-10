'use strict';
/**
 * Gestion des filtres d'éléments en fonction des paramètres choisis.
 * 
 * Chaque type de structure a son propre filtre (on peut demander à 
 * ce qu'ils soient synchronisés)
 */
class EFilter {

  static get PANEL_CLONE(){return DGet('div.filter-form-container')}

  /**
   * Fonction appelée pour ouvrir la boite de filtre.
   */
  static openFilter(name){
    const filter = new EFilter(MetaSTT.current)
    filter.show()
  }

  /**
   * Pour ouvrir un bloc de réglage d'une condition (text, couleur, etc.)
   * 
   * @param {DomElement} cb Le checkbox principal de la propriété de filtre
   * @param {Boolean} force True/False, la valeur à forcer, quel que soit l'état
   */
  static openPropSetting(cb, force){
    let isOpen ;
    if ( force === undefined ) {
      isOpen = cb.dataset.open == 'true'
    } else {
      isOpen = !force
    }
    cb.nextSibling.nextSibling.classList[isOpen?'add':'remove']('invisible')
    cb.dataset.open = isOpen ? 'false' : 'true'
  }

  static togglePreviousCb(span){
    const cb = span.previousSibling
    cb.checked = !cb.checked;
    this.openPropSetting(cb)
  }

  static addFilter(name, data){
    const stt     = MetaSTT.current
    const prefs   = stt.preferences
    const filters = stt.preferences.filters || {}
    Object.assign(filters, {[name]: data})
    stt.preferences.filters = filters
    stt.setModified()
  }

  /**
   * Fonction appelée pour supprimer un filtre
   * 
   * @param {String} fName Le nom du filtre, qui sert de clé dans les préférences.
   */
  static removeFilter(fName) {
    if ( !confirm(`Êtes-vous certain de vouloir supprimer le filtre '${fName}'`)){ return false }
    const stt = MetaSTT.current
    delete stt.preferences.filters[fName]
    stt.setModified()
    return true
  }

  // ========= I N S T A N C E   E F I L T E R ==========

  constructor(stt){
    this.stt = stt
    // console.log("stt", stt)
    this.prepare()
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
      // Dès qu'un filtre ne passe pas, on arrête
      if ( !ok ) return ;
    }
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
    const fName = prompt("Quel nom donner à ce filtre ?")
    if ( fName ) {
      if ( this.stt.preferences.filters && this.stt.preferences.filters[fName]){
        if (!confirm("Voulez-vous vraiment remplacer le filtre existant ?")) return false;
      }
      // On met les valeurs dans this.data
      this.getFilterValue()
      this.constructor.addFilter(fName, this.data)
      this.buildMenuFiltres()
    }
  }

  divOf(elt){
    return DGet(`*[data-id="${elt.id}"]`, this.disposition)
  }

  get disposition(){return this._dispo || (this._dispo = this.stt.disposition.obj)}

  filterByText(methodComp, elt){
    return methodComp(elt.pitch)
  }
  filterByType(dfilter, elt){
    const value = elt.data.type
    if ( dfilter.condition == 'is' ) { return value == dfilter.value }
    else { return value != dfilter.value }
  }
  filterByState(dfilter, elt){
    const value = elt.data.state
    if ( dfilter.condition == 'is' ) { return value == dfilter.value }
    else { return value != dfilter.value }
  }
  filterByColor(methodComp, elt){
    return methodComp(elt.color)
  }
  filterByTension(methodComp, elt){
    return elt.tension && methodComp(elt.tensionData.level)
  }
  filterByTags(methodComp, elt){
    return methodComp(elt.tagsAsMap)
  }

  /**
   * Applique les valeurs d'un filtre mémorisé
   */
  setFilterValues(data){
    ;['text','type','state','tags','tension','color'].forEach(fprop => {
      const cb = DGet(`input[type="checkbox"].cb-filtre-on-${fprop}`, this.obj)
      const dataProp = data[fprop]
      if ( dataProp ) {
        cb.checked = true
        switch(fprop){
          case 'type':
            this.typeField.value      = dataProp.value
            this.typeCondField.value  = dataProp.condition
            break;
          case 'text':
            this.textField.value      = dataProp.text
            this.textCondField.value  = dataProp.condition
            break;
          case 'state':
            this.stateField.value     = dataProp.value
            this.stateCondField.value = dataProp.condition
            break;
          case 'tags':
            this.tagCondField.value = dataProp.condition
            this.cocheTags(dataProp.tags)
            break
          case 'tension':
            this.tensionOpField.value = dataProp.operand
            this.tensionField.value   = dataProp.value
            break
          case 'color':
            this.colorCondField.value = dataProp.condition
            this.cocheColors(dataProp.colors)
            break
          default:
            console.log("Je dois apprendre à régler", dataProp)
        }
      } else {
        // Il faut désactiver ce filtre
        cb.checked = false
      }
      this.constructor.openPropSetting(cb, cb.checked)
    })
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
    const filterData = {} // pour mémorisation
    

    // --- Filtre par texte ---
    const text = this.filtreOn('text') && NullIfEmpty(this.textField.value.trim())
    if ( text ) {
      const parText = {condition: this.textCondField.value, text: text}
      Object.assign(filterData, {text: {condition: parText.condition, text: text}})

      const method = (cond => {
        let regexp;
        switch(cond){
          case 'all words':
            return this.textContainsAllWords.bind(this, text.split(' '))
          case 'one word':
            regexp = new RegExp(`(${text.split(' ').join('|')})`, "i")
            return this.textMatch.bind(this, regexp)
          case 'sentence':
            regexp = new RegExp(text, "i")
            return this.textMatch.bind(this, regexp)
        }
      })(parText.condition)
      filter.push(this.filterByText.bind(this, method))
    }

    // --- Filtre par type ---
    if ( this.filtreOn('type') ) {
      const parTypeCond = this.typeCondField.value
      const parType     = {condition: parTypeCond, value:this.typeField.value}
      filter.push(this.filterByType.bind(this, parType))
      Object.assign(filterData, {type: parType})
    }

    // --- Filtre par état ---
    if ( this.filtreOn('state') ) {
      const parStateCond = this.stateCondField.value
      const parState = {condition: parStateCond, value: this.stateField.value}
      filter.push(this.filterByState.bind(this, parState))
      Object.assign(filterData, {state: parState})
    }

    // --- Filtre par Tags ---
    if ( this.filtreOn('tags') ){
      const allTags = []
      this.forEachTag(tag => { tag.checked && allTags.push(tag.name)})
      if ( allTags.length ) {
        const condTags = this.tagCondField.value
        Object.assign(filterData, {tags: {condition: condTags, tags: allTags}})
        const method = (cond => {
          switch(cond){
            case 'all': return this.containsAllTags.bind(this, allTags);
            case 'one': return this.containsOneTagAmong.bind(this, allTags);
            case 'none': return this.notContainsAllTags.bind(this, allTags);
            case 'no-one': return this.containsAnyAmong.bind(this, allTags);
          }
        })(condTags)
        filter.push(this.filterByTags.bind(this, method))
      }
    }

    // --- Filtre par tension ---
    if ( this.filtreOn('tension') ){
      const tensOperand = NullIfEmpty(this.tensionOpField.value)
      const tensValue   = NullIfEmpty(this.tensionField.value)
      if ( tensOperand && tensValue ) {
        Object.assign(filterData, {tension: {operand: tensOperand, value: tensValue}})
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
    }
    
    // --- Filtre par couleur ---
    if ( this.filtreOn('color') ){
      const colors = {}
      DGetAll('input[type="checkbox"]', this.colorsField).map(cb => {
        if ( cb.checked ) Object.assign(colors, {[cb.dataset.id]: true})
      })
      if ( Object.keys(colors).length ) {
        const condColor = this.colorCondField.value
        Object.assign(filterData, {color: {condition: condColor, colors: Object.keys(colors)}})
        const method = (cond => {
          switch(cond){
            case 'in': return this.hasColorIn.bind(this, colors);
            case 'out': return this.hasNotColorIn.bind(this, colors)
          }
        })(condColor)
        filter.push(this.filterByColor.bind(this, method))
      }
    }

    this.data = filterData

    if (filter.length) {
      return filter
    } else {
      Flash.notice("Aucun filtre n'est défini.")
    }
  }

  /**
   * @return True si le filtre de type +type+ est activé
   */
  filtreOn(type){
    return DGet(`input.cb-filtre-on-${type}`, this.obj).checked
  }

  
  // Méthodes de filtrage

  textMatch(regExp, str){
    return !(null === str.match(regExp))
  }

  isSup(ref, comp){return comp > ref }
  isSupOrEqual(ref, comp){return comp >= ref}
  isInf(ref, comp){ return comp < ref }
  isInfOrEqual(ref, comp){return comp <= ref}
  isDiff(ref, comp){return comp != ref}
  isEqual(ref, comp){return comp == ref}

  containsAnyAmong(tags, comp){
    for( const tag of tags ) { if ( comp[tag] === true ) return false; }
    return true
  }
  notContainsAllTags(tags, comp){
    for(var tag of Object.keys(comp)){
      if ( !tags.includes(tag) ) return true;
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
  hasColorIn(colors, color){
    return colors[color] == true
  }
  hasNotColorIn(colors, color){
    return !this.hasColorIn(colors, color)
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
    Color.buildColorCbs(this.colorsField)
    // S'il y a des filtres enregistrés
    if (this.stt.preferences.filters) this.buildMenuFiltres() ;
    // On observe les champs et boutons qui doivent l'être
    this.observe()
    return o ; // pour _obj
  }

  /**
   * Fonction appelée quand on choisit un filtre dans le menu
   */
  onChooseFilter(ev){
    const menu = this.menuFiltres
    const filterName = menu.value;
    const dataFilter = this.stt.preferences.filters[filterName]
    this.setFilterValues(dataFilter)
    this.apply()
    menu.selectedIndex = 0
    this.setRemoveButton(filterName)
  }

  /**
   * Fonction réglant le bouton pour supprimer le filtre courant
   * 
   * @param {String|Undefined} fName Le nom du filtre si on doit montrer le bouton, sinon on le cache.
   */
  setRemoveButton(fName){
    this.btnSupFilter.classList[fName ? 'remove' : 'add']('invisible')
    this.btnSupFilter.dataset.name = fName || "";
  }

  /**
   * Appelée quand on clique sur le bouton pour supprimer le filtre courant
   */
  onWantToRemoveFilter(ev){
    if ( this.constructor.removeFilter(this.btnSupFilter.dataset.name) ) {
      this.buildMenuFiltres()
      this.setRemoveButton()
    }
  }

  buildMenuFiltres(){
    this.menuFiltres.innerHTML = ""
    this.menuFiltres.appendChild(DCreate('OPTION', {value: "", text:"Filtre…"}))
    for (const fName in this.stt.preferences.filters) {
      this.menuFiltres.appendChild(DCreate('OPTION', {value: fName, text: fName}))
    }
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
   * Fonction utilisée par les filtres mémorisés pour sélectionner
   * les tags
   */
  cocheTags(tags){
    this.stt.tags.forEach(dtag => {
      const checked = tags.includes(dtag.name)
      const cbtagid = `${this.stt.classname}-cb-tag-${dtag.name.replace(" ", "")}`
      DGet(`input#${cbtagid}`, this.obj).checked = checked
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

  /**
   * Fonction appelée par le filtre mémorisé pour cocher les 
   * couleurs du filtre
   */
  cocheColors(colors){
    Color.each(dcolor => {
      const checked = colors.includes(dcolor.id)
      const cb = DGet(`input[type="checkbox"][data-id="${dcolor.id}"]`, this.obj)
      cb.checked = checked
    })
  }

  observe(){
    this.btnFilter.addEventListener('click', this.apply.bind(this))
    this.btnReset.addEventListener('click', this.reset.bind(this))
    this.btnHide.addEventListener('click', this.hide.bind(this))
    this.btnMemo.addEventListener('click', this.memorize.bind(this))
    this.menuFiltres.addEventListener('change', this.onChooseFilter.bind(this))
    this.btnSupFilter.addEventListener('click', this.onWantToRemoveFilter.bind(this))
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
  textContainsAllWords(words, str){
    for( var word of words ){
      if ( str.indexOf(word) < 0 ) return false;
    }
    return true
  }

  get textField(){return DGet('input.filter-text', this.obj)}
  get textCondField(){return DGet('select.filter-text-condition', this.obj)}
  get typeField(){return DGet('select.filter-type', this.obj)}
  get typeCondField(){return DGet('select.filter-type-condition', this.obj)}
  get stateField(){return DGet('select.filter-state', this.obj)}
  get stateCondField(){return DGet('select.filter-state-condition', this.obj)}
  get tagsField(){return DGet('div.filter-tags', this.obj)}
  get tagCondField(){return DGet('select.filter-tags-condition', this.obj)}
  get tensionField(){return DGet('input.filter-tension', this.obj)}
  get tensionOpField(){return DGet('select.filter-tension-operand', this.obj)}
  get colorCondField(){return DGet('select.filter-color-condition', this.obj)}
  get colorsField(){return DGet('div.color-cbs', this.obj)}
  get menuFiltres(){return DGet('select.filtres-memo', this.obj)}
  get btnFilter(){return DGet('button.btn-filter', this.obj)}
  get btnReset(){return DGet('button.btn-reset', this.obj)}
  get btnMemo(){return DGet('button.btn-memo', this.obj)}
  get btnHide(){return DGet('button.btn-hide', this.obj)}
  get btnSupFilter(){return DGet('button.btn-sup-filter', this.obj)}

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
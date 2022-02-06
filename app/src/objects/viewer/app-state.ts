import { getNumber, getUnknownChildObject } from  '@/objects/util'
import ExpansionPanelState from './expansion-panel-state'
import SlidePanelState from './slide-panel-state'
import Jsonable from '../jsonable'

export default class AppState extends Jsonable{
  activePageIndex: number
  expansionPanel: ExpansionPanelState
  slidePanel: SlidePanelState

  constructor(data?: unknown) {
    super()
    if (typeof data === 'undefined') {
      data = {}
    }
    this.activePageIndex = getNumber(data, "activePageIndex", 0)
    const expansionPanel = getUnknownChildObject(data, "expansionPanel", {isOpen: false, componentName: ''})
    this.expansionPanel = new ExpansionPanelState(expansionPanel)
    const slidePanel = getUnknownChildObject(data, "slidePanel", {isOpen: false})
    this.slidePanel = new SlidePanelState(slidePanel)
  }
}
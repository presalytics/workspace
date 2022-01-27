import { getNumber, getUnknownChildObject } from  '@/objects/util'
import ExpansionPanelState from './expansion-panel-state'
import Jsonable from '../jsonable'

export default class AppState extends Jsonable{
  activePageIndex: number
  expansionPanel: ExpansionPanelState

  constructor(data?: unknown) {
    super()
    if (typeof data === 'undefined') {
      data = {}
    }
    this.activePageIndex = getNumber(data, "activePageIndex", 0)
    const expansionPanel = getUnknownChildObject(data, "expansionPanel")
    this.expansionPanel = new ExpansionPanelState(expansionPanel)
  }
}
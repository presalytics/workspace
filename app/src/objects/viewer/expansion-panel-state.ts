import { getBoolean, getString } from "@/objects/util"


export default class ExpansionPanelState{
  isOpen: boolean
  componentName: string

  constructor(data: unknown) {
    this.isOpen = getBoolean(data, "isOpen", false)
    this.componentName = getString(data, "componentName", "")
  }


}
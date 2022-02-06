import { getBoolean } from "@/objects/util"


export default class SlidePanelState{
  isOpen: boolean

  constructor(data: unknown) {
    this.isOpen = getBoolean(data, "isOpen", false)
  }


}
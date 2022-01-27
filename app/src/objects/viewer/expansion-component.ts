import { getString, getBoolean } from '@/objects/util'

export default class ExpansionComponent{
  icon: string
  color: string
  tooltip: string
  component: string
  disabled: boolean
  title: string

  constructor(data: unknown) {
    this.icon = getString(data, "icon")
    this.color = getString(data, "color" )
    this.tooltip = getString(data, "tooltip")
    this.disabled = getBoolean(data, "disabled")
    this.component = getString(data, "component")
    this.title = getString(data, "title")
  }
}
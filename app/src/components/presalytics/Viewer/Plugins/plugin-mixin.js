// export default {
//   data: () => () => ({
//     pluginData: {
//       mpld3: {
//         type: 'script',
//         src: 'https://cdn.jsdelivr.net/npm/mpld3@0.5.5/d3.v5.min.js',
//         requires: ['d3'],
//       },
//       d3: {
//         source: 'https://d3js.org/d3.v5.min.js'
//       }
//     }
//   }),
//   mounted() {
//     if (this.plugins) {
//       if (!this.$refs.pluginParent) {
//         throw new Error('Components implementing the PluginMixin must have a this.$refs.pluginParent defined')
//       }
//       this.
//       this.plugins.forEach( (cur) => {
//         this.addPlugin(cur, this.$refs.pluginParent)
//       })
//     }
//   },
//   methods: {
//     addPlugin(plugin, parentElement) {
//       if (!parentElement) {
//         parentElement = this.$el
//       }
//       let entry = this.pluginsData[plugin.kind]
//       if (plugin.config) entry.config = plugin.config      
//       if (entry.requires?.length > 0) {
//         entry.requires.forEach( (cur) => {
//           this._addToDom(this.plugins[cur], parentElement)
//         })
//       }
//       this._addToDom(entry, parentElement)
//     },
//     _addScriptToDom(scriptData, parentElement) {
//       let sc = document.createElement('script')
//       sc.setAttribute('src', scriptData.src)
//       if (scriptData.attributes) this._addAttributes(scriptData.attributes, sc)
//       parentElement.appendChild(sc)
//     },
//     _addStyleToDom(styleSrc, parentElement) {
//       let st = document.createElement('style')

//     },
//     _addLinkToDom(linkSrc, parentElement) {
//       let l = document.createElement('link')
//       l.setAttribute('href', linkSrc)
//       parentElement.appendChild(l)
//     },
//     _addToDom(plugin, parentElement) {
//       switch (plugin.type) {
//         case('script'): {
//           this._addScriptToDom(plugin, parentElement)
//           break
//         }
//         case('style'): {
//           this._addStyleToDom(plugin, parentElement)
//           break
//         }
//         case('link'): {
//           this._addLinkToDom(plugin, parentElement)
//           break
//         }
//         default: {
//           throw new Error('Unknown Plugin Type: ' + plugin.type)
//         }
//       }
//     },
//     _addAttributes(attributes, element) {
//       for (const key in attributes) {
//         element.setAttribute(key, attributes[key])
//       }
//     }
//   }
// }
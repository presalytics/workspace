<script>
  import Vue from 'vue'

  export default {
    name: 'Sandbox',
    data: () => ({
      iApp: {}
    }),
    beforeUpdate() {
      //freezing to prevent unnessessary Reactifiation of vNodes
      this.iApp.children = Object.freeze(this.$slots.default)
    },
    methods: {
      renderChildren() {
        const children = this.$slots.default
        const body = this.$el.contentDocument.body      
        const el = document.createElement('DIV') // we will mount or nested app to this element
        body.appendChild(el)

        const iApp = new Vue({
          name: 'IApp',
          //freezing to prevent unnessessary Reactifiation of vNodes
          data: { children: Object.freeze(children) }, 
          render(h) {
            return h('div', this.children)
          },
        })
        iApp.$mount(el) // mount into iframe
        this.iApp = iApp // cache instance for later updates
      }
    },
    render(h) {
      return  h('iframe', {
        attrs: {
          frameborder: "0",
          scrolling: "auto",
          class: 'responsive-frame',
          style: 'max-height: none; max-width: none; height:100%; width: 100%;',
          sandbox: 'allow-forms allow-scripts allow-same-origin'
        },
        on: { load: this.renderChildren }
      })
    },
  }
</script>
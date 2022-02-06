<template>
  <div class="svg-container">
    <template v-if="isLoading">
      <preloader />
    </template>
    <template v-else>
      <template v-if="thumbnail">
        <v-img
          :src="pngBlobUrl"
          contain
        >
          <p>This widget failed to render.  Are you you sure to put the right Id in your outline?</p>
        </v-img>
      </template>
      <template v-else>
        <div class="svg-overlay" />
        <object
          type="image/svg+xml"
          :data="svgBlobUrl"
          class="svg-object"
        >
          <v-img
            :src="pngBlobUrl"
            contain
          >
            <p>This widget failed to render.  Are you you sure to put the right Id in your outline?</p>
          </v-img>
        </object>
      </template>
    </template>
  </div>
</template>

<script>
import widgetMixin from './widget-mixin'
import Preloader from '@/components/presalytics/Preloader.vue'

export default {
  name: 'OoxmlWidget',
  components: {Preloader},
  mixins: [widgetMixin],
  data: () => ({
    svgBlobUrl: null,
    pngBlobUrl: null,
    resizer: null,
    listener: null,
    isLoading: true
  }),
  computed: {
    ooxmlId() {
      return this.widget.data.objectOoxmlId
    },
    objectType() {
      return this.widget.data.endpointId
    },
  },
  created() {
    this.$dispatcher.localEventBus.$on('image.updated', this.handleNewImage)
    this.initImages()
    this.isLoading = false
  },
  beforeDestroy() {
    this.$dispatcher.localEventBus.$off('image.updated', this.handleNewImage)
  },
  mounted() {
    this.resizer = new ResizeObserver(entries => {
      var _timeout
      for (const entry of entries) {
        clearTimeout(_timeout)
        _timeout = setTimeout(this.resizeSvgContainer(entry.target), 100)
      }
    })
    this.resizer.observe(this.$el.parentElement)
  },
  methods: {
    handleNewImage(evt) {
      if (evt.apiKey === this.ooxmlId) {
        if (evt.imageType === "png") {
          this.pngBlobUrl = URL.createObjectURL(evt.blob)
        } else if (evt.imageType === "svg") {
          // eslint-disable-next-line
          console.log("Blob size: " + evt.blob.size)
          this.svgBlobUrl = URL.createObjectURL(evt.blob)
        }
      }
    },
    initImages() {
      this.getPngImage()
      if (!this.thumbnail) {
          this.getSvgImage()
      }
    },
    getSvgImage() {
      this.$store.dispatch('images/getImage', {
        apiKey: this.ooxmlId,
        imageType: "svg",
        metadata: {
          objectType: this.objectType,
          source: 'ooxml',
        }
      })
    },
    getPngImage() {
      this.$store.dispatch('images/getImage', {
        apiKey: this.ooxmlId,
        imageType: "png",
        metadata: {
          objectType: this.objectType,
          source: 'ooxml',

        }
      })
    },
    resizeSvgContainer (parentElement) {
      var svgContainer = parentElement.querySelector('.svg-container')
      if (svgContainer.getElementsByTagName('object').length > 0) {
        if (!svgContainer.getElementsByTagName('object')[0].contentDocument) {
          return
        }
        var svgElement = svgContainer.getElementsByTagName('object')[0].contentDocument.rootElement
        if (!svgElement) {
          return
        }
        var svgViewBox = svgElement.attributes.viewBox.value
        var svgHeight = parseInt(svgViewBox.split(' ')[2])
        var svgWidth = parseInt(svgViewBox.split(' ')[3])
        var aspect = svgWidth / svgHeight

        var parentHeight = parentElement.offsetHeight
        var parentWidth = parentElement.offsetWidth

        var containerWidth = parentWidth
        var containerHeight = containerWidth * aspect

        if (containerHeight > parentHeight) {
          containerHeight = parentHeight
          containerWidth = containerHeight / aspect
        }

        var heightMargin = Math.max((parentHeight - containerHeight) / 2, 0)
        var widthMargin = Math.max((parentWidth - containerWidth) / 2, 0)

        svgContainer.style.width = containerWidth + 'px'
        svgContainer.style.height = containerHeight + 'px'
        svgContainer.style.top = heightMargin + 'px'
        svgContainer.style.left = widthMargin + 'px'
      } 
    }
  }
}

</script>

<style lang="sass">
  .svg-container
    position: relative
    height: 100%
    width: 100%
  .svg-overlay
    height: 100%
    width: 100%
    z-index: 1
    opacity: 100%
    position: absolute
  .svg-object
    z-index: -1
</style>
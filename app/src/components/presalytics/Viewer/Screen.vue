<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    class="viewer-container"
  >
    <template v-if="loading">
      loading...
    </template>
    <template v-else>
      <div
        class="d-none"
        v-html="renderedStyles"
      />
      <div
        class="d-none"
        v-html="renderedScripts"
      />
      <swiper
        ref="mySwiper"
        class="swiper"
        :options="swiperOptions"
        @ready="onReady"
        @slideChangeTransitionEnd="handleAFterSlideChange"
      >
        <swiper-slide
          v-for="(page, id) in pages"
          :key="id"
          v-html="decodeContent(page)"
        />
        <div
          slot="pagination"
          class="swiper-pagination"
        />
        <div
          slot="button-prev"
          class="swiper-button-prev"
        />
        <div
          slot="button-next"
          class="swiper-button-next"
        />
      </swiper>
    </template>
  </div>
</template>

<script>
  import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
  import { v4 as uuidv4 } from 'uuid'
  import 'swiper/css/swiper.min.css'
  import { toPng } from 'html-to-image'
  import Worker from './screen.worker?worker'

  const worker = new Worker()

  export default {
    components: {
      Swiper,
      SwiperSlide,
    },
    props: {
      storyId: {
        type: String,
        default: '',
      },
    },
    data: () => ({
      ignoreScripts: [
        'ooxml',
      ],
      swiperOptions: {
        pagination: {
          el: '.swiper-pagination',
          type: 'progressbar',
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      },
      svgResizeObserver: null,
      screenShotMakerRef: null,
    }),
    computed: {
      swiper () {
        if (this.$refs.mySwiper) {
          return this.$refs.mySwiper.$swiper
        } else {
          return null
        }
      },
      story () {
        if (this.storyId) {
          return this.$store.getters['stories/story'](this.storyId)
        } else {
          return null
        }
      },
      outline () {
        if (this.story) {
          return this.$store.getters['stories/outline'](this.storyId)
        } else {
          return null
        }
      },
      loading () {
        return this.content === null
      },
      content () {
        if (this.storyId) {
          return this.$store.getters['stories/content'](this.storyId)
        } else {
          return null
        }
      },
      scripts () {
        if (this.content) {
          return this.content.scripts
        } else {
          return []
        }
      },
      renderedScripts () {
        return this.scripts.reduce((acc, cur) => {
          var decoded = this.decodeContent(cur)
          var ignore = this.ignoreScripts.reduce((accum, ele) => {
            if (decoded.includes(ele) && !accum) {
              accum = true
            }
            return accum
          }, false)
          if (!ignore) {
            acc += this.decodeContent(cur)
          }
          return acc
        }, '')
      },
      styles () {
        if (this.content) {
          return this.content.styles
        } else {
          return []
        }
      },
      renderedStyles () {
        return this.styles.reduce((acc, cur) => {
          return acc + this.decodeContent(cur)
        }, '')
      },
      pages () {
        if (this.content) {
          return this.content.pages
        } else {
          return []
        }
      },
    },
    watch: {
      storyId: function () {
        this.render()
      },
    },
    mounted () {
      this.render()

      worker.onmessage = ({ data }) => {
        switch (data.type) {
          case ('accessToken'): {
            this.sendAccessTokenToWorker()
            break
          }
          case ('ooxmlSvgBlob'): {
            // console.log('Received Ooxml Object Response') // esline-disable-line
            this.handleOoxmlUpdate(data.ooxmlId, data.blob)
            break
          }
          case ('cachedIframeBlob'): {
            // console.log('Received Cached IFrame Response') // esline-disable-line
            this.handleCachedIframe(data.nonce, data.blob)
            break
          }
          case ('updateOutline'): {
            // console.log('Received Outline Update Response') // esline-disable-line
            this.$store.dispatch('stories/setStoryOutline', { storyId: data.storyId, outline: data.outline })
          }
        }
      }

      this.svgResizeObserver = new ResizeObserver(entries => {
        var _timeout
        for (const entry of entries) {
          clearTimeout(_timeout)
          _timeout = setTimeout(this.resizeSvgContainer(entry.target), 100)
        }
      })

      var svgContainers = Array.from(this.$el.querySelectorAll('.svg-container'))
      svgContainers.forEach((cur) => this.svgResizeObserver.observe(cur.parentNode))

      setTimeout(() => this.makeThumbnail(), 2000)
    },
    beforeDestroy () {
      if (this.svgResizeObserver) {
        this.svgResizeObserver.disconnect()
      }
    },
    methods: {
      render () {
        if (this.storyId) {
          this.$store.dispatch('stories/render', this.storyId)
        }
      },
      onClick () {
        alert('swiper clicked!')
      },
      decodeContent (encodedContent) {
        var decoded = Buffer.from(encodedContent, 'base64').toString()
        return this.postProcessContent(decoded)
      },
      htmlToElement (html) {
        var template = document.createElement('template')
        html = html.trim() // Never return a text node of whitespace as the result
        template.innerHTML = html
        return template.content.firstChild
      },
      onReady () {
        this.sendAccessTokenToWorker()
        var svgContainers = Array.from(this.$el.querySelectorAll('.svg-container'))
        svgContainers.forEach((cur) => {
          // this.directSvgAppend(cur)
          worker.postMessage({
            request: 'ooxmlsvg',
            ooxmlId: cur.dataset.objectId,
            objectType: cur.dataset.objectType,
          })
        })
      },
      handleOoxmlUpdate (ooxmlId, ooxmlBlob) {
        var blobUri = URL.createObjectURL(ooxmlBlob)
        var svgNodeList = this.$el.querySelectorAll('.svg-container')
        Array.from(svgNodeList).filter((cur) => {
          return cur.dataset.objectId === ooxmlId
        }).forEach((cur) => {
          this.appendObjectToSvgContainer(cur, blobUri)
        })
      },
      appendObjectToSvgContainer (svgContainerElement, blobUri) {
        var overlay = document.createElement('div')
        overlay.classList.add('svg-overlay')
        var svgObject = document.createElement('object')
        svgObject.setAttribute('type', 'image/svg+xml')
        svgObject.setAttribute('data', blobUri)
        svgObject.setAttribute('style', 'z-index:-1')
        var fallbackMsg = document.createElement('p')
        fallbackMsg.innerHTML = 'This object Failed to render. Please upgrade your browser to the latest version'
        svgObject.appendChild(fallbackMsg)
        svgContainerElement.appendChild(svgObject)
        svgContainerElement.parentNode.appendChild(overlay)
        this.removePreloader(svgContainerElement.parentNode)
      },
      directSvgAppend (svgContainerElement) {
        var proxyUrl = Buffer.from('/' + svgContainerElement.dataset.objectType + '/Svg/' + svgContainerElement.dataset.objectId).toString('base64')
        var url = '/api/workspace/secure-proxy/ooxml/' + proxyUrl
        var overlay = document.createElement('div')
        overlay.classList.add('svg-overlay')
        var svgObject = document.createElement('object')
        svgObject.setAttribute('type', 'image/svg+xml')
        svgObject.setAttribute('data', url)
        svgObject.setAttribute('style', 'z-index:-1')
        var fallbackMsg = document.createElement('p')
        fallbackMsg.innerHTML = 'This object Failed to render. Please upgrade your browser to the latest version'
        svgObject.appendChild(fallbackMsg)
        svgContainerElement.appendChild(svgObject)
        svgContainerElement.parentNode.appendChild(overlay)
        this.removePreloader(svgContainerElement.parentNode)
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
      },
      removePreloader (parentElement) {
        var preloader = parentElement.querySelector('div.preloader-container')
        if (preloader) {
          preloader.remove()
        }
      },
      postProcessContent (content) {
        var element = this.htmlToElement(content)
        if (element) {
          Array.from(element.querySelectorAll('iframe.presalytics-cached')).forEach((cur) => this.loadIframesInWorker(cur))
          return element.outerHTML
        } else {
          return null
        }
      },
      loadIframesInWorker (frameElement) {
        var nonce = uuidv4()
        frameElement.setAttribute('id', nonce)
        var src = frameElement.src
        frameElement.src = ''
        this.sendAccessTokenToWorker()
        worker.postMessage({
          request: 'cachedFrame',
          nonce: nonce,
          src: src,
        })
      },
      handleCachedIframe (nonce, blob) {
        var url = URL.createObjectURL(blob)
        var frame = document.getElementById(nonce)
        if (frame && url) {
          frame.src = url
        }
      },
      resizeCurrentElement () {
        if (this.$el) {
          var obj = this.$el.querySelector('.swiper-slide-active')
          if (obj) {
            this.resizeSvgContainer(obj)
          }
        }
      },
      handleAFterSlideChange () {
        this.resizeCurrentElement()
        if (this.screenShotMakerRef) {
          clearTimeout(this.screenShotMakerRef)
        }
        this.screenShotMakerRef = setTimeout(this.makeThumbnail, 500)
      },
      getPageIdFromSlideIndex (slideIndex = null) {
        if (!slideIndex) {
          slideIndex = this.swiper.activeIndex
        }
        return this.$store.state.stories.outlines[this.outline]?.document.pages[slideIndex]?.id
      },
      makeThumbnail () {
        if (!this.loading) {
          var element = this.$el.querySelector('.swiper-slide-active')
          var pageId = this.getPageIdFromSlideIndex()
          var vm = this
          var isPreloader = !!element.querySelector('.preloader-container')
          if (vm && pageId && !isPreloader) {
            toPng(element)
              .then(function (dataUrl) {
                var img = new Image()
                img.src = dataUrl
                document.body.appendChild(img)
              })
            // html2canvas(element, {
            //   allowTaint: true,
            //   useCORS: true,
            //   scale: 1,
            //   logging: true,
            //   foreignObjectRendering: true,
            //   removeContainer: true,
            //   async: true,
            // }).then(function (canvas) {
            //   // var dataUrl = canvas.toDataURL()
            //   document.body.appendChild(canvas)
            //   // vm.addUriToOutline(pageId, dataUrl, vm.storyId)
            //   // worker.postMessage({
            //   //   request: 'makeThumbnail',
            //   //   dataUrl: dataUrl,
            //   //   pageId: pageId,
            //   //   storyId: vm.storyId,
            //   // })
            // })
          }
        }
      },
      addUriToOutline (pageId, dataUri, storyId) {
        var outline = this.$store.getters['stories/outline'](storyId)
        outline.pages = outline.pages.map((cur) => {
          if (cur.id === pageId) {
            cur.thumbnail = dataUri
          }
          return cur
        })
        this.$store.dispatch('stories/setStoryOutline', { storyId: storyId, outline: outline })
      },
      sendAccessTokenToWorker () {
        worker.postMessage({
          request: 'accessToken',
          accessToken: this.$store.getters.accessToken,
        })
      },
    },
  }
</script>

<style lang="sass" scoped>
  .swiper-slide
    width: auto !important
    flex-basis: 100%
    height: 100%
  .viewer-container
    height: 100%
    width: 100%
  .swiper
    height: 100%
    width: 100%
  .svg-overlay
    height: 100%
    width: 100%
    z-index: 1
    opacity: 100%
    position: absolute
</style>

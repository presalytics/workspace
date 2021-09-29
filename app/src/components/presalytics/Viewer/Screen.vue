<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    class="viewer-container"
  >
    <swiper
      ref="mySwiper"
      class="swiper"
      :options="swiperOptions"
    >
      <swiper-slide
        v-for="(page, id) in pages"
        :key="id"
      >
        <component 
          :is="getPageComponent(page.kind)" 
          ref="pageComponents" 
          :page="page"
        />
      </swiper-slide>
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
  </div>
</template>

<script>
  import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
  import 'swiper/css/swiper.min.css'
  import SharedWorker from './screen.worker?sharedworker'
  import Sandbox from './Sandbox.vue'

  const worker = new SharedWorker()

  export default {
    components: {
      Swiper,
      SwiperSlide,
      Sandbox,
    },
    props: {
      storyId: {
        type: String,
        default: '',
      },
    },
    data: () => ({
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
      pageComponents: {
        'widget-page': () => import('./Pages/WidgetPage.vue')
      }
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
      pages() {
        if (!this.outline) return null
        return this.outline.document.pages
      }
    },
    mounted () {
      worker.addEventListener('message', this.listenToWorkerMessages)
    },
    beforeDestroy () {
      worker.removeEventListener('message', this.listenToWorkerMessages)
    },
    methods: {
      listenToWorkerMessages(e) {
        switch (e.data.type) {
          case ('accessToken'): {
            this.sendAccessTokenToWorker()
            break
          }
          case ('cachedIframeBlob'): {
            // console.log('Received Cached IFrame Response') // esline-disable-line
            this.handleCachedIframe(e.data.nonce, e.data.blob)
            break
          }
          case ('updateOutline'): {
            // console.log('Received Outline Update Response') // esline-disable-line
            this.$store.dispatch('stories/setStoryOutline', { storyId: e.data.storyId, outline: e.data.outline })
          }
        }
      },
      getPageComponent(pageKind) {
        return this.pageComponents[pageKind]
      },
      onClick () {
        alert('swiper clicked!')
      },
      // loadIframesInWorker (frameElement) {
      //   var nonce = uuidv4()
      //   frameElement.setAttribute('id', nonce)
      //   var src = frameElement.src
      //   frameElement.src = ''
      //   this.sendAccessTokenToWorker()
      //   worker.postMessage({
      //     request: 'cachedFrame',
      //     nonce: nonce,
      //     src: src,
      //   })
      // },
      resizeCurrentElement () {
        if (this.$el) {
          var obj = this.$el.querySelector('.swiper-slide-active')
          if (obj) {
            this.resizeSvgContainer(obj)
          }
        }
      },
      // handleAFterSlideChange () {
      //   this.resizeCurrentElement()
      //   if (this.screenShotMakerRef) {
      //     clearTimeout(this.screenShotMakerRef)
      //   }
      //   this.screenShotMakerRef = setTimeout(this.makeThumbnail, 500)
      // },
      getPageIdFromSlideIndex (slideIndex = null) {
        if (!slideIndex) {
          slideIndex = this.swiper.activeIndex
        }
        return this.$store.state.stories.outlines[this.outline]?.document.pages[slideIndex]?.id
      },
      // makeThumbnail () {
      //   if (!this.loading) {
      //     var element = this.$el.querySelector('.swiper-slide-active')
      //     var pageId = this.getPageIdFromSlideIndex()
      //     var vm = this
      //     var isPreloader = !!element.querySelector('.preloader-container')
      //     if (vm && pageId && !isPreloader) {
      //       toPng(element)
      //         .then(function (dataUrl) {
      //           var img = new Image()
      //           img.src = dataUrl
      //           document.body.appendChild(img)
      //         })
      //       // html2canvas(element, {
      //       //   allowTaint: true,
      //       //   useCORS: true,
      //       //   scale: 1,
      //       //   logging: true,
      //       //   foreignObjectRendering: true,
      //       //   removeContainer: true,
      //       //   async: true,
      //       // }).then(function (canvas) {
      //       //   // var dataUrl = canvas.toDataURL()
      //       //   document.body.appendChild(canvas)
      //       //   // vm.addUriToOutline(pageId, dataUrl, vm.storyId)
      //       //   // worker.postMessage({
      //       //   //   request: 'makeThumbnail',
      //       //   //   dataUrl: dataUrl,
      //       //   //   pageId: pageId,
      //       //   //   storyId: vm.storyId,
      //       //   // })
      //       // })
      //     }
      //   }
      // },
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
    }
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

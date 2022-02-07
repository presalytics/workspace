<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    class="viewer-container"
  >
    <swiper
      ref="swiper"
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

<script lang="ts">
  import Vue, { VueConstructor } from 'vue'
  import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
  import SwiperClass from 'swiper/node_modules/swiper/types/swiper-class'
  import ViewerMixin from './mixins/viewer-mixin'
  import PageMixin from './mixins/page-mixin'
  import WidgetPage from './Pages/WidgetPage.vue'
  import 'swiper/css/swiper.min.css'
  import Sandbox from './Sandbox.vue'
  import StoryPage from '@/objects/story/story-page'

  declare module 'vue-awesome-swiper' {
    export interface Swiper {
      $swiper?: SwiperClass
    }
  }

  const pageComponents: Record<string, VueConstructor<Vue & ThisType<typeof PageMixin>>> = {
    'widget-page': WidgetPage
  }

  export default (Vue as VueConstructor<Vue & InstanceType<typeof ViewerMixin>>).extend({
    components: {
      Swiper,
      SwiperSlide,
      Sandbox,
    },
    mixins: [ViewerMixin],
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
      pageActiveStartTime: () => Date.now()
    }),
    computed: {
      pages(): Array<StoryPage> {
        return this.outline.document.pages
      }
    },
    watch: {
      activePageIndex(newValue) {
        this.getSwiper().slideTo(newValue, 500)
      }
    },
    mounted () {
      window.addEventListener('keyup', this.handleKeyUpEvent)
    },
    beforeDestroy() {
      window.removeEventListener('keyup', this.handleKeyUpEvent)
    },
    methods: {
      getSwiper(): SwiperClass {
        if (typeof this.$refs.swiper === 'undefined') {
          throw new Error('Refernece to Swiper could not be found.  Has the swiper rendered?')
        }
        const swiperRef = this.$refs.swiper as Swiper
        return swiperRef.$swiper as SwiperClass
      },
      getPageComponent(pageKind: string): VueConstructor<Vue & ThisType<typeof PageMixin>> {
        return pageComponents[pageKind]
      },
      handleKeyUpEvent(e: KeyboardEvent): void {
        switch (e.key) {
          case('f'): {
            this.toggleFullscreen()
            break
          }
        }
      },
      // onSlideChange() {
      //   this.$dispatcher.emit('story.page_view', this.getPageviewModel())
      // },
      // getPageViewModel() {
      //   return {
      //     slideChangeTime: Date.now(),
      //     storyId: this.storyId,
      //     fromPageNumber: '<insertStartPageNumber>',
      //     toPageNumber: '<insertTargetPageNumber>',
      //     fromPageId: '<insertStartPageId',
      //     toPageId: '<insertTargetPageId',
      //     fromPageActiveMilliseconds: Date.now() - this.pageActiveStartTime
      //   }
      // },
      // resizeCurrentElement () {
      //   if (this.$el) {
      //     var obj = this.$el.querySelector('.swiper-slide-active')
      //     if (obj) {
      //       this.resizeSvgContainer(obj)
      //     }
      //   }
      // },
      toggleFullscreen() { 
        if (
              document.fullscreenElement ||
              document.webkitFullscreenElement ||
              document.mozFullScreenElement ||
              document.msFullscreenElement
            ) {
              if (document.exitFullscreen) {
                document.exitFullscreen();
              } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen(); 
              } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
              } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
              }
            } else {
              let element = this.$el;
              if (element.requestFullscreen) {
                element.requestFullscreen();
              } else if (element.mozRequestFullscreen) {
                element.mozRequestFullscreen();
              } else if (element.webkitRequestFullscreen) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
              } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
              }
            }
      }
    }
  })
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

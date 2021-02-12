<template>
  <div class="d-flex justify-center align-center preloader-container">
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="200"
      height="200"
      viewbox="0 0 200 200"
    >
      <g id="dancing-bar-chart">
        <rect
          class="preloader-rect-1"
          width="30"
          x="5"
          height="200"
        />
        <rect
          class="preloader-rect-2"
          x="45"
          width="30"
          height="200"
        />
        <rect
          class="preloader-rect-3"
          x="85"
          width="30"
          height="200"
        />
        <rect
          class="preloader-rect-4"
          x="125"
          width="30"
          height="200"
        />
        <rect
          class="preloader-rect-5"
          x="165"
          width="30"
          height="200"
        />
        <line
          class="preloader-baseline"
          x1="0"
          x2="200"
          y1="200"
          y2="200"
          stroke-width="3"
          stroke-linecap="butt"
        />
      </g>
    </svg>
  </div>
</template>

<script>
  export default {
    name: 'Preloader',
  }
</script>

<style lang="sass">

  .preloader-container
    height: 100%
    width: 100%

  @keyframes loading-bar-morph
    0%
        height: 24px
    20%
        height: 64px
    40%
        height: 200px
    60%
        height: 150px
    80%
        height: 80px
    100%
        height: 10px

  .preloader-rect-1
    fill: var(--v-primary-base)
    animation: loading-bar-morph 2s linear .1s infinite
    transform-origin: 20px 100px
    transform: rotate(180deg)

  .preloader-rect-2
    fill: var(--v-success-base)
    animation: loading-bar-morph 2.2s linear .2s infinite
    transform-origin: 60px 100px
    transform: rotate(180deg)

  .preloader-rect-3
    fill: var(--v-warning-base)
    animation: loading-bar-morph 1.6s linear .3s infinite
    transform-origin: 100px 100px
    transform: rotate(180deg)

  .preloader-rect-4
    fill: var(--v-info-base)
    animation: loading-bar-morph 3s linear .4s infinite
    transform-origin: 140px 100px
    transform: rotate(180deg)

  .preloader-rect-5
    fill: var(--v-error-base)
    animation: loading-bar-morph 2.2s linear .5s infinite
    transform-origin: 180px 100px
    transform: rotate(180deg)

  .preloader-baseline
    stroke: var(--v-primary-darken4)

  .preloader-container
    height: 100%
    padding: 0
    margin: 0
    display: -webkit-box
    display: -moz-box
    display: -ms-flexbox
    display: -webkit-flex
    display: flex
    align-items: center
    justify-content: center
    background-color: var(--v-light)

  .preloader-row
    width: auto

  .empty-parent
    height: 100%
    width: 100%
    background-color: var(--v-light)
    z-index: -10

</style>

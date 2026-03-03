<template>
  <router-view v-slot="{ Component, route }">
    <transition name="slide" mode="out-in" appear>
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>
</template>

<script lang="ts" setup>
  defineOptions({ name: 'ArtAgentMain' })
</script>

<style lang="scss" scoped>
  /* 默认聊天页面：上下滑动动画 */
  .slide-enter-from {
    margin-top: 200px;
    opacity: 0;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.3s; /* 缓出动画 */
  }

  .slide-enter-to {
    margin-top: 0;
    opacity: 1;
  }

  .slide-leave-from {
    margin-top: 0;
    opacity: 1;
  }

  .slide-leave-to {
    margin-top: 200px;
    opacity: 0;
  }

  /* 带id聊天页面：中间缩放动画 */
  // .zoom-fade-enter-from {
  //   transform: scale(0.9); /* 进入前：缩小隐藏 */
  //   opacity: 0;
  // }
  // .zoom-fade-enter-active,
  // .zoom-fade-leave-active {
  //   transition: all 0.3s; /* 缓入动画 */
  // }
  // .zoom-fade-enter-to {
  //   transform: scale(1); /* 进入后：正常大小 */
  //   opacity: 1;
  // }
  // .zoom-fade-leave-from {
  //   transform: scale(1); /* 离开前：正常大小 */
  //   opacity: 1;
  // }
  // .zoom-fade-leave-to {
  //   transform: scale(0.9); /* 离开后：缩小隐藏 */
  //   opacity: 0;
  // }
</style>

<template>
  <div>
    <ElButton v-if="!collapsed" link @click="collapsed = !collapsed">
      <ArtSvgIcon icon="mingcute:layout-leftbar-open-line" class="text-xl" />
    </ElButton>
  </div>
  <ElButton type="primary">登录</ElButton>
</template>

<script lang="ts" setup>
  defineOptions({ name: 'ArtAgentHeader' })
  const collapsed = useLocalStorage(COLLAPSED, false)
  // 监听屏幕变化，当屏幕宽度大于1280 时，不折叠侧边栏
  const isMediumScreen = useMediaQuery('(min-width: 1280px)')
  watch(
    () => isMediumScreen.value,
    (val) => {
      collapsed.value = val
    }
  )
</script>

<style scoped lang="scss"></style>

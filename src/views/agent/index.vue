<template>
  <el-container class="!h-full">
    <ArtAgentAside width="280px" />
    <el-container class="bg-white">
      <el-header class="flex items-center justify-between">
        <ArtAgentHeader />
      </el-header>
      <el-main>
        <ArtAgentMain />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
  import ArtAgentAside from '@/components/core/layouts/art-agent/Aside.vue'
  import ArtAgentHeader from '@/components/core/layouts/art-agent/Header.vue'
  import ArtAgentMain from '@/components/core/layouts/art-agent/Main.vue'
</script>

<style lang="scss" scoped></style>

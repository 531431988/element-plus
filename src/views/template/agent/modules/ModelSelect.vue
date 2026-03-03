<!-- 切换模型 -->
<script setup lang="ts">
  import { useModelStore } from '@stores/modules/model'

  const modelStore = useModelStore()

  onMounted(async () => {
    await modelStore.requestModelList()
    // 设置默认模型
    if (
      modelStore.modelList.length > 0 &&
      (!modelStore.currentModelInfo || !modelStore.currentModelInfo.modelName)
    ) {
      modelStore.setCurrentModelInfo(modelStore.modelList[0])
    }
  })

  const currentModelName = computed(
    () => modelStore.currentModelInfo && modelStore.currentModelInfo.modelName
  )
  const popoverList = computed(() => modelStore.modelList)
  const buttonRef = ref()
  const popoverRef = ref<PopoverInstance>()
  const onClickOutside = () => {
    popoverRef.value?.hide()
  }
</script>

<template>
  <div class="model-select">
    <div
      ref="buttonRef"
      v-click-outside="onClickOutside"
      class="art-agent-menu-item border-1 border-[rgba(0,0,0,0.08)] border-solid"
    >
      <ArtSvgIcon icon="ri:openai-line" class="text-lg" />
      <div class="model-select-box-text font-size-12px">
        {{ currentModelName }}
      </div>
    </div>
    <ElPopover ref="popoverRef" :virtual-ref="buttonRef" trigger="click" placement="top-start">
      <div
        v-for="item in popoverList"
        :key="item.id"
        class="art-agent-menu-item text-overflow select-none transition-all transition-duration-300 hover:cursor-pointer" :class="{ 'bg-black/5 is-select': item.modelName === currentModelName }"
      >
      {{ item.modelName }}
      </div>
    </ElPopover>
  </div>
</template>

<style scoped lang="scss"></style>

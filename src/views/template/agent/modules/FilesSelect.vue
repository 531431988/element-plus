<!-- 文件上传 -->
<script setup lang="ts">
  import type { FilesCardProps } from 'vue-element-plus-x/types/FilesCard'
  import { useFileDialog } from '@vueuse/core'
  import { ElMessage } from 'element-plus'
  import { useFilesStore } from '@stores/modules/files'
  import { ClickOutside as vClickOutside } from 'element-plus'

  type FilesList = FilesCardProps & {
    file: File
  }

  const filesStore = useFilesStore()

  const { reset, open, onChange } = useFileDialog({
    // 允许所有图片文件，文档文件，音视频文件
    accept: 'image/*,video/*,audio/*,application/*',
    directory: false, // 是否允许选择文件夹
    multiple: true // 是否允许多选
  })

  onChange((files) => {
    if (!files) return
    console.log('files', files)
    const arr = [] as FilesList[]
    for (let i = 0; i < files!.length; i++) {
      const file = files![i]
      arr.push({
        uid: crypto.randomUUID(), // 不写 uid，文件列表展示不出来，elx 1.2.0 bug 待修复
        name: file.name,
        fileSize: file.size,
        file,
        maxWidth: '200px',
        showDelIcon: true, // 显示删除图标
        imgPreview: true, // 显示图片预览
        imgVariant: 'square', // 图片预览的形状
        url: URL.createObjectURL(file) // 图片预览地址
      })
    }
    filesStore.setFilesList([...filesStore.filesList, ...arr])
    // 重置文件选择器
    nextTick(() => reset())
  })

  function handleUploadFiles() {
    open()
    popoverRef.value.hide()
  }
  const buttonRef = ref()
  const popoverRef = ref<PopoverInstance>()
  const onClickOutside = () => {
    popoverRef.value?.hide()
  }
</script>

<template>
  <div class="files-select">
    <div
      ref="buttonRef"
      v-click-outside="onClickOutside"
      class="art-agent-menu-item border-1 border-[rgba(0,0,0,0.08)] border-solid"
    >
      <ArtSvgIcon icon="tdesign:attach" class="text-lg" />
    </div>
    <ElPopover
      ref="popoverRef"
      placement="top-start"
      trigger="click"
      :virtual-ref="buttonRef"
      width="180px"
      :show-arrow="false"
    >
      <div class="popover-content-box">
        <div class="art-agent-menu-item" @click="handleUploadFiles">
          <ArtSvgIcon icon="material-symbols:upload-sharp" />
          <div class="text-sm"> 上传文件或图片 </div>
        </div>

        <ElPopover placement="right-end" trigger="hover">
          <template #reference>
            <div class="art-agent-menu-item items-center justify-between">
              <div class="flex items-center">
                <ArtSvgIcon icon="ion:code-slash" />
                <span class="text-sm"> 上传代码 </span>
              </div>
              <ArtSvgIcon icon="ion:chevron-forward" />
            </div>
          </template>

          <div class="popover-content-box">
            <div
              class="art-agent-menu-item"
              @click="
                () => {
                  ElMessage.warning('暂未开放')
                }
              "
            >
              代码文件
            </div>

            <div
              class="art-agent-menu-item"
              @click="
                () => {
                  ElMessage.warning('暂未开放')
                }
              "
            >
              代码文件夹
            </div>
          </div>
        </ElPopover>
      </div>
    </ElPopover>
  </div>
</template>

<style scoped lang="scss"></style>

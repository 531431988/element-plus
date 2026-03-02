<!-- 左树右表示例页面 -->
<template>
  <div class="art-full-height">
    <div class="box-border flex gap-4 h-full max-md:block max-md:gap-0 max-md:h-auto">
      <div class="flex-shrink-0 w-58 h-full max-md:w-full max-md:h-auto max-md:mb-5">
        <ElCard class="tree-card art-card-xs flex flex-col h-full mt-0" shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <b>分类列表</b>
              <ElButton type="primary" v-ripple>新增</ElButton>
            </div>
          </template>
          <ElScrollbar v-loading="treeLoading">
            <ElTree
              ref="treeRef"
              :data="treeData"
              :props="treeProps"
              node-key="id"
              default-expand-all
              highlight-current
              @node-click="handleNodeClick"
            />
          </ElScrollbar>
        </ElCard>
      </div>

      <div class="flex flex-col flex-grow min-w-0">
        <DictSearch v-model="defaultFilter" @search="handleSearch" @reset="resetSearchParams" />

        <ElCard class="flex flex-col flex-1 min-h-0 art-table-card" shadow="never">
          <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
            <template #left>
              <ElSpace wrap>
                <ElButton type="primary" v-ripple>新增字典项</ElButton>
              </ElSpace>
            </template>
          </ArtTableHeader>

          <ArtTable
            rowKey="id"
            :loading="loading"
            :data="data"
            :columns="columns"
            :pagination="pagination"
            @pagination:size-change="handleSizeChange"
            @pagination:current-change="handleCurrentChange"
          >
          </ArtTable>
        </ElCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchGetDictTypeList,
    fetchGetDictItemList,
    fetchUpdateDictItem
  } from '@/api/system/dict'
  import DictSearch from '@/views/system/dict/modules/dict-search.vue'
  import { ElSwitch, ElMessage } from 'element-plus'

  defineOptions({ name: 'TreeTable' })

  type DictTypeListItem = Api.SystemManage.DictTypeListItem
  type DictItemListItem = Api.SystemManage.DictItemListItem

  // 树形数据
  const treeData = ref<DictTypeListItem[]>([])
  const treeLoading = ref(false)
  const treeRef = ref()

  // 树形配置
  const treeProps = {
    children: 'children',
    label: 'name'
  }

  // 当前选中的节点
  const currentNode = ref<DictTypeListItem | null>(null)

  /**
   * 加载字典分类树数据
   */
  const loadTreeData = async () => {
    treeLoading.value = true
    try {
      const res = await fetchGetDictTypeList({ page: 1, pageSize: 1000 })
      treeData.value = res.list || []

      // 默认选中第一个节点并加载数据
      if (treeData.value.length > 0) {
        const firstNode = treeData.value[0]
        currentNode.value = firstNode

        // 等待 DOM 更新后设置选中状态
        await nextTick()
        treeRef.value?.setCurrentKey(firstNode.id)

        // 加载右边表格数据
        searchParams.dictId = firstNode.id
        getData()
      }
    } catch (error) {
      console.error('加载字典分类失败:', error)
      treeData.value = []
    } finally {
      treeLoading.value = false
    }
  }

  /**
   * 处理树节点点击
   */
  const handleNodeClick = (data: DictTypeListItem) => {
    console.log('选中节点:', data)
    currentNode.value = data
    // 根据选中的节点更新右侧表格数据
    searchParams.dictId = data.id
    getData()
  }

  // 初始化加载树数据
  onMounted(() => {
    loadTreeData()
  })

  // 表单搜索初始值
  const defaultFilter = ref({
    name: undefined
  })

  const {
    data,
    columns,
    columnChecks,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    refreshData,
    handleSizeChange,
    handleCurrentChange
  } = useTable({
    core: {
      apiFn: fetchGetDictItemList,
      apiParams: {
        page: 1,
        pageSize: 20,
        dictId: ''
      },
      immediate: false,
      columnsFactory: () => [
        {
          prop: 'name',
          label: '字典项名称',
          minWidth: 120,
          showOverflowTooltip: true
        },
        {
          prop: 'code',
          label: '字典值',
          minWidth: 120
        },
        {
          prop: 'enabled',
          label: '状态',
          width: 100,
          formatter: (row: DictItemListItem) => {
            return h(ElSwitch, {
              modelValue: row.enabled,
              'inline-prompt': true,
              'active-text': '启用',
              'inactive-text': '停用',
              'active-value': 1,
              'inactive-value': 0,
              'onUpdate:modelValue': async (val: number) => {
                try {
                  await fetchUpdateDictItem({ ...row, enabled: val })
                  ElMessage.success('操作成功')
                  refreshData()
                } catch (error) {}
              }
            })
          }
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 180
        }
      ]
    }
  })
  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    console.log(params)
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
  }
</script>

<style scoped>
  .tree-card :deep(.el-card__body) {
    flex: 1;
    min-height: 0;
    padding: 10px 2px 10px 10px;
    border: none !important;
  }
</style>

<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
    width="30%"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
      <ElFormItem label="角色名称" prop="name">
        <ElInput v-model="form.name" placeholder="请输入角色名称" />
      </ElFormItem>
      <ElFormItem label="角色类型" prop="roleType"> </ElFormItem>
      <ElFormItem label="角色描述" prop="remark">
        <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入角色描述" />
      </ElFormItem>
      <ElFormItem label="状态">
        <ElSwitch
          v-model="form.enabled"
          :active-value="1"
          :inactive-value="0"
          active-text="启用"
          inactive-text="停用"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchSaveRole, fetchUpdateRole } from '@/api/system/role'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage, ElSelect, ElOption, ElInput } from 'element-plus'
  import { ref, reactive, computed, watch, nextTick } from 'vue'

  type RoleListItem = Api.SystemManage.RoleListItem

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
  })

  /**
   * 表单数据
   */
  const form = reactive({
    id: 0,
    name: '',
    roleType: 1,
    remark: '',
    enabled: 1
  })

  /**
   * 监听弹窗打开，初始化表单数据
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) {
        initForm()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    }
  )

  /**
   * 监听角色数据变化，更新表单
   */
  watch(
    () => props.roleData,
    (newData) => {
      if (newData && props.modelValue) {
        initForm()
      }
    },
    { deep: true }
  )

  /**
   * 初始化表单数据
   * 根据弹窗类型填充表单或重置表单
   */
  const initForm = () => {
    if (props.dialogType === 'edit' && props.roleData) {
      Object.assign(form, {
        id: props.roleData.id || 0,
        name: props.roleData.name || '',
        roleType: props.roleData.roleType || 1,
        remark: props.roleData.remark || '',
        enabled: props.roleData.enabled || 0
      })
    } else {
      Object.assign(form, {
        id: 0,
        name: '',
        roleType: 1,
        remark: '',
        enabled: 1
      })
    }
  }

  /**
   * 关闭弹窗并重置表单
   */
  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  /**
   * 提交表单
   * 验证通过后调用新增或更新接口
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    try {
      const isEdit = props.dialogType === 'edit'
      const params: Api.SystemManage.SaveRoleParams = {
        name: form.name,
        roleType: form.roleType,
        remark: form.remark,
        enabled: form.enabled
      }

      if (isEdit) {
        await fetchUpdateRole({ ...params, id: form.id })
        ElMessage.success('修改成功')
      } else {
        await fetchSaveRole(params)
        ElMessage.success('新增成功')
      }

      emit('success')
      handleClose()
    } catch (error) {
      console.error(isEdit ? '更新角色失败:' : '新增角色失败:', error)
      ElMessage.error(isEdit ? '更新失败，请重试' : '新增失败，请重试')
    }
  }
</script>

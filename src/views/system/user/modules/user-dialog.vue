<template>
  <ElDialog
    v-model="dialogVisible"
    :title="type === 'add' ? '添加用户' : '编辑用户'"
    width="30%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="登录账户" prop="userName">
        <ElInput v-model="formData.userName" placeholder="请输入用户名" />
      </ElFormItem>
      <ElFormItem label="用户名" prop="realName">
        <ElInput v-model="formData.realName" placeholder="请输入用户名" />
      </ElFormItem>
      <ElFormItem label="手机号" prop="mobilePhone">
        <ElInput v-model="formData.mobilePhone" placeholder="请输入手机号" />
      </ElFormItem>
      <ElFormItem label="状态" prop="isLocked">
        <ElSwitch
          v-model="formData.isLocked"
          :active-value="0"
          :inactive-value="1"
          active-text="启用"
          inactive-text="禁用"
        />
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput type="textarea" v-model="formData.remark" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchSaveUser, fetchUpdateUser } from '@/api/system-manage'
  import type { FormInstance, FormRules } from 'element-plus'

  interface Props {
    type: string
    userData?: Partial<Api.SystemManage.UserListItem>
  }

  interface Emits {
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 使用 defineModel 实现双向绑定
  const dialogVisible = defineModel<boolean>('visible', { default: false })

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    userName: '',
    realName: '',
    mobilePhone: '',
    isLocked: 0,
    remark: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9]+$/, message: '只能输入英文或数字', trigger: 'blur' }
    ],
    mobilePhone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    realName: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
  }

  /**
   * 初始化表单数据
   * 根据对话框类型（新增/编辑）填充表单
   */
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData
    const row = props.userData

    Object.assign(formData, {
      userName: isEdit && row ? row.userName || '' : '',
      realName: isEdit && row ? row.realName || '' : '',
      mobilePhone: isEdit && row ? row.mobilePhone || '' : '',
      isLocked: isEdit && row ? row.isLocked || 0 : 0,
      remark: isEdit && row ? row.remark || '' : ''
    })
  }

  /**
   * 监听对话框状态变化
   * 当对话框打开时初始化表单数据并清除验证状态
   */
  watch(
    () => [dialogVisible.value, props.type, props.userData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  /**
   * 提交表单
   * 验证通过后调用保存或更新接口
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    try {
      const isEdit = props.type === 'edit'
      const params: Api.SystemManage.SaveUserParams = {
        userName: formData.userName,
        realName: formData.realName,
        mobilePhone: formData.mobilePhone,
        isLocked: formData.isLocked,
        remark: formData.remark
      }
      // 根据类型调用不同接口
      if (isEdit) {
        params.id = props.userData.id
        await fetchUpdateUser(params)
        ElMessage.success('更新成功')
      } else {
        await fetchSaveUser(params)
        ElMessage.success('添加成功')
      }

      dialogVisible.value = false
      emit('submit')
    } catch (error) {
      console.error(isEdit ? '更新用户失败:' : '新增用户失败:', error)
      ElMessage.error(isEdit ? '更新失败，请重试' : '添加失败，请重试')
    }
  }
</script>

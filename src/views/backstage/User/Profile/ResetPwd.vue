<template>
  <el-dialog
    v-model="visible"
    title="安全重置密码"
    width="480px"
    class="pro-dialog"
    append-to-body
    :close-on-click-modal="false"
  >
    <div class="reset-pwd-form">
      <el-alert
        title="提示"
        type="info"
        description="修改成功后，系统将自动登出，请使用新密码重新登录。"
        show-icon
        :closable="false"
        class="mb-20 dark-alert"
      />

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item
          label="当前旧密码"
          prop="oldPassword"
        >
          <el-input
            v-model="form.oldPassword"
            type="password"
            placeholder="请输入当前正在使用的密码"
            show-password
          />
        </el-form-item>

        <el-form-item
          label="设置新密码"
          prop="newPassword"
        >
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="请输入 6-20 位新密码"
            show-password
          />
        </el-form-item>

        <el-form-item
          label="确认新密码"
          prop="confirmPassword"
        >
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer button-row">
        <el-button
          round
          @click="visible = false"
        >
          取消
        </el-button>
        <el-button
          round
          type="primary"
          @click="handleSubmit"
        >
          确认修改
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {updatePassword} from "@/api/backstage/admin.js";
import {ElMessage} from "element-plus";
import router from "@/router/index.js";
import {removeToken} from "@/utils/auth.js";
import {useUserStore} from "@/stores/user.js";

const visible = ref(false)
const formRef = ref(null)

const userStore = useUserStore()

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirm = (rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的新密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}

const open = () => {
  visible.value = true
  if (formRef.value) formRef.value.resetFields()
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      updatePassword(form).then((res) => {
        visible.value = false
        // 成功后提示并跳转到登录页
        ElMessage.success(res.message || '修改密码成功')
        setTimeout(() => {
          //移除token
          userStore.clearUser()
          removeToken()
          // 跳转到登录页
          router.push('/backstage/login')
        }, 1000)
      })
    }
  })
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.reset-pwd-form {
  padding: 10px 0;
  .mb-20 { margin-bottom: 20px; }

  .dark-alert {
    background-color: #1a1a1a;
    border: 1px solid #333;
    color: rgba(255, 255, 255, 0.85);
    :deep(.el-alert__title), :deep(.el-alert__description) {
      color: rgba(255, 255, 255, 0.85);
    }
  }
}
</style>

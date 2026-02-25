<template>
  <div class="comment-settings-panel">
    <div class="pro-card">
      <div class="card-body">
        <el-form
          :model="commentForm"
          label-position="left"
          label-width="150px"
        >
          <el-form-item label="开启评论">
            <el-switch v-model="commentForm.enable" />
          </el-form-item>
          <el-form-item label="评论审核">
            <el-switch v-model="commentForm.audit" />
          </el-form-item>
          <el-form-item label="邮件通知">
            <el-switch v-model="commentForm.emailNotify" />
          </el-form-item>
          <el-form-item label="黑名单关键词">
            <el-input
              v-model="commentForm.blacklist"
              type="textarea"
              :rows="4"
              placeholder="每行一个关键词"
            />
          </el-form-item>
          <div class="form-actions mt-20">
            <el-button
              type="primary"
              size="large"
              round
              @click="handleSaveComment"
            >
              保存评论设置
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const commentForm = reactive({
  enable: true,
  audit: true,
  emailNotify: false,
  blacklist: '广告\n色情\n暴力'
})

const handleSaveComment = () => {
  // TODO: 对接后端评论设置API
  ElMessage.success('评论设置保存成功')
}
</script>

<style scoped lang="scss">
.comment-settings-panel {
  .mt-20 { 
    margin-top: 20px; 
  }

  .pro-card {
    background: var(--backstage-card-bg);
    border: 1px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-xl);
    box-shadow: var(--backstage-shadow-light);

    .card-body {
      padding: 30px;
    }
  }

  .form-actions {
    border-top: 1px solid var(--backstage-border-color);
    padding-top: 24px;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}
</style>

<template>
  <div class="config-manage">
    <el-tabs v-model="activeTab" class="pro-tabs">
      <el-tab-pane label="站点基础" name="basic">
        <div class="pro-card mt-10">
          <div class="card-body">
            <el-form :model="basicForm" label-position="top" class="config-form">
              <el-row :gutter="40">
                <el-col :span="12">
                  <el-form-item label="站点名称">
                    <el-input v-model="basicForm.siteName" placeholder="显示在浏览器标题栏" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="站点副标题">
                    <el-input v-model="basicForm.subTitle" placeholder="站点的 Slogan" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="关键词 (Keywords)">
                    <el-input v-model="basicForm.keywords" placeholder="以英文逗号分隔" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="站点描述 (Description)">
                    <el-input v-model="basicForm.description" type="textarea" :rows="3" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="备案号">
                    <el-input v-model="basicForm.icp" placeholder="ICP 备案号" />
                  </el-form-item>
                </el-col>
              </el-row>
              <div class="form-actions mt-20">
                <el-button type="primary" size="large" round @click="handleSaveBasic">保存基础设置</el-button>
              </div>
            </el-form>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="评论设置" name="comment">
        <div class="pro-card mt-10">
          <div class="card-body">
            <el-form :model="commentForm" label-position="left" label-width="150px">
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
                <el-input v-model="commentForm.blacklist" type="textarea" :rows="4" placeholder="每行一个关键词" />
              </el-form-item>
              <div class="form-actions mt-20">
                <el-button type="primary" size="large" round @click="handleSaveComment">保存评论设置</el-button>
              </div>
            </el-form>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="关于我" name="about">
        <div class="pro-card mt-10">
          <div class="card-body">
            <el-form :model="aboutForm" label-position="top">
              <el-form-item label="个人简介 (Markdown)">
                <el-input v-model="aboutForm.content" type="textarea" :rows="15" placeholder="支持 Markdown 格式内容" />
              </el-form-item>
              <div class="form-actions mt-20">
                <el-button type="primary" size="large" round @click="handleSaveAbout">更新关于页面</el-button>
              </div>
            </el-form>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const activeTab = ref('basic')

const basicForm = reactive({
  siteName: 'My PRO MAX Blog',
  subTitle: '一只程序猿的修行之路',
  keywords: 'Vue3, Vite, UI, Design',
  description: '这是使用 Vue3 和 Element Plus 构建的现代化个人博客系统。',
  icp: '沪ICP备12345678号'
})

const commentForm = reactive({
  enable: true,
  audit: true,
  emailNotify: false,
  blacklist: '广告\n色情\n暴力'
})

const aboutForm = reactive({
  content: '# 关于我\n\n我是 Qoder，一个热爱前端开发的工程师...'
})

const handleSaveBasic = () => {
  // TODO: 调用后端接口保存
}

const handleSaveComment = () => {
  // TODO: 调用后端接口保存
}

const handleSaveAbout = () => {
  // TODO: 调用后端接口保存
}
</script>

<style scoped lang="scss">
.config-manage {
  .mt-10 { margin-top: 10px; }
  .mt-20 { margin-top: 20px; }

  .pro-card {
    background: var(--backstage-card-bg);
    border: 1px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-xl);
    box-shadow: var(--backstage-shadow-light);
    
    .card-body {
      padding: 30px;
    }
  }

  .pro-tabs {
    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }
    :deep(.el-tabs__item) {
      font-size: 15px;
      font-weight: 500;
      padding: 0 24px;
      height: 48px;
      line-height: 48px;
    }
    :deep(.el-tabs__active-bar) {
      height: 3px;
      border-radius: 3px;
    }
  }

  .config-form {
    max-width: 800px;
  }

  .form-actions {
    border-top: 1px solid var(--backstage-border-color);
    padding-top: 24px;
  }
}
</style>

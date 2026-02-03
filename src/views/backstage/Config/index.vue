<template>
  <div class="config-manage">
    <el-tabs v-model="activeTab" class="pro-tabs">
      <el-tab-pane label="社交链接" name="social">
        <div class="pro-card mt-10">
          <div class="card-header-actions">
            <el-button type="primary" icon="Plus" round @click="handleAdd">新增链接</el-button>
          </div>
          <div class="card-body">
            <el-table :data="socialList" v-loading="loading" style="width: 100%" border stripe class="social-table">
              <el-table-column prop="name" label="名称" width="120" />
              <el-table-column label="图标" width="80" align="center">
                <template #default="scope">
                  <div class="icon-preview">
                    <i v-if="scope.row.icon.startsWith('el-icon-')" :class="scope.row.icon"></i>
                    <img v-else-if="scope.row.icon.startsWith('/') || scope.row.icon.startsWith('http')" :src="scope.row.icon" class="icon-img theme-icon" />
                    <span v-else>{{ scope.row.icon }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="tip" label="提示文本" show-overflow-tooltip />
              <el-table-column prop="url" label="跳转链接" show-overflow-tooltip />
              <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
              <el-table-column label="状态" width="100" align="center">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    active-value="1"
                    inactive-value="0"
                    @change="handleStatusChange(scope.row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center">
                <template #default="scope">
                  <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
                  <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>

      <!-- 社交链接对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="550px"
        append-to-body
        destroy-on-close
      >
        <el-form :model="socialForm" label-width="80px" label-position="left">
          <el-form-item label="名称" required>
            <el-input v-model="socialForm.name" placeholder="请输入社交平台名称" />
          </el-form-item>
          <el-form-item label="图标方式" required>
            <el-radio-group v-model="iconType">
              <el-radio label="class">图标类名</el-radio>
              <el-radio label="upload">本地上传</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="图标内容" required>
            <!-- 类名输入 -->
            <el-input v-if="iconType === 'class'" v-model="socialForm.icon" placeholder="例如: /images/icon/github.png" />

            <!-- 上传占位 -->
            <div v-if="iconType === 'upload'" class="upload-placeholder">
              <el-upload
                class="icon-uploader"
                action="#"
                :auto-upload="false"
                disabled
              >
                <el-icon class="uploader-icon"><Plus /></el-icon>
                <template #tip>
                  <div class="el-upload__tip">上传接口暂未实现，请先使用预设图标或类名</div>
                </template>
              </el-upload>
            </div>
          </el-form-item>

          <el-form-item label="提示文本">
            <el-input v-model="socialForm.tip" placeholder="请输入悬浮提示文本" />
          </el-form-item>
          <el-form-item label="链接地址" required>
            <el-input v-model="socialForm.url" placeholder="请输入跳转链接" />
          </el-form-item>
          <el-form-item label="排序序号">
            <el-input-number v-model="socialForm.sortOrder" :min="0" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitSocialForm">确定</el-button>
          </span>
        </template>
      </el-dialog>

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
import { ref, reactive, onMounted } from 'vue'
import { getSocialLink, addSocial, updateSocial, deleteSocial, updateSocialStatus } from '@/api/backstage/socialLink'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('social')

// 社交链接相关
const loading = ref(false)
const socialList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')

// 图标处理
const iconType = ref('class')

const socialForm = reactive({
  socialLinkId: undefined,
  name: '',
  icon: '',
  tip: '',
  url: '',
  sortOrder: 0,
})

const fetchSocialLinks = async () => {
  loading.value = true
  try {
    const res = await getSocialLink()
    socialList.value = res.data || []
  } catch (error) {
    console.error('获取社交链接失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增社交链接'
  iconType.value = 'class'
  Object.assign(socialForm, {
    socialLinkId: undefined,
    name: '',
    icon: '',
    tip: '',
    url: '',
    sortOrder: 0,
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑社交链接'
  // 根据图标内容判断类型
  if (row.icon.startsWith('')) {
    iconType.value = 'class'
  } else {
    iconType.value = 'upload'
  }

  Object.assign(socialForm, {
    socialLinkId: row.socialLinkId,
    name: row.name,
    icon: row.icon,
    tip: row.tip,
    url: row.url,
    sortOrder: row.sortOrder,
  })
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除社交链接 "${row.name}" 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteSocial(row.socialLinkId)
    ElMessage.success('删除成功')
    fetchSocialLinks()
  }).catch(() => {})
}

const handleStatusChange = async (row) => {
  try {
    await updateSocialStatus({
      socialLinkId: row.socialLinkId,
      status: row.status
    })
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = row.status === '1' ? '0' : '1' // 恢复状态
    console.error('更新状态失败:', error)
  }
}

const submitSocialForm = async () => {
  if (!socialForm.name || !socialForm.icon || !socialForm.url) {
    ElMessage.warning('请填写必填项')
    return
  }

  try {
    if (socialForm.socialLinkId) {
      await updateSocial(socialForm)
      ElMessage.success('修改成功')
    } else {
      await addSocial(socialForm)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchSocialLinks()
  } catch (error) {
    console.error('保存社交链接失败:', error)
  }
}

onMounted(() => {
  fetchSocialLinks()
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

    .card-header-actions {
      padding: 20px 30px 0;
      display: flex;
      justify-content: flex-end;
    }

    .card-body {
      padding: 30px;
    }
  }

  .icon-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    .icon-img {
      width: 24px;
      height: 24px;
      object-fit: contain;

      &.theme-icon {
        // 在明亮模式下，如果图标是纯白的（通过 brightness/invert 处理过），需要反转回黑色
        [data-theme='light'] & {
          filter: invert(1) contrast(200%);
        }
      }
    }
  }

  .preset-icons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    max-height: 180px;
    overflow-y: auto;
    padding: 8px;
    background: var(--backstage-bg-color);
    border-radius: var(--backstage-radius-md);

    .preset-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6px;
      border: 1px solid var(--backstage-border-color);
      border-radius: var(--backstage-radius-sm);
      cursor: pointer;
      transition: all 0.2s;
      background: var(--backstage-card-bg);

      &:hover {
        border-color: var(--backstage-primary-light);
        transform: translateY(-2px);
      }

      &.active {
        background: var(--backstage-primary-lighter);
        border-color: var(--backstage-primary);
        box-shadow: 0 0 0 2px var(--backstage-primary-lighter);

        span {
          color: var(--backstage-primary);
          font-weight: 600;
        }
      }

      img {
        width: 20px;
        height: 20px;
        margin-bottom: 4px;
        object-fit: contain;

        [data-theme='light'] & {
          filter: invert(1) brightness(0.2);
        }
      }

      span {
        font-size: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        text-align: center;
      }
    }
  }

  .upload-placeholder {
    .icon-uploader {
      border: 1px dashed var(--backstage-border-color);
      border-radius: var(--backstage-radius-md);
      cursor: not-allowed;
      text-align: center;
      padding: 20px;

      .uploader-icon {
        font-size: 28px;
        color: var(--backstage-text-placeholder);
      }
    }
  }

  .social-table {
    :deep(.el-table__row--striped) {
      td.el-table__cell {
        background: var(--backstage-card-hover-bg) !important;
      }
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

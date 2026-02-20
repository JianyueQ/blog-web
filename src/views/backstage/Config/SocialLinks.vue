<template>
  <MobileSocialLinks v-if="isMobile" ref="mobileRef" />
  <div v-else class="social-links-panel">
    <div class="pro-card">
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

    <!-- 社交链接对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="550px"
      append-to-body
      destroy-on-close
      class="theme-dialog"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getSocialLink, addSocial, updateSocial, deleteSocial, updateSocialStatus } from '@/api/backstage/socialLink'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import MobileSocialLinks from './MobileSocialLinks.vue'

// 检测是否为移动端
const isMobile = computed(() => window.innerWidth < 768)
const mobileRef = ref(null)

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
  if (!isMobile.value) {
    fetchSocialLinks()
  }
})
</script>

<style scoped lang="scss">
.social-links-panel {
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
        [data-theme='light'] & {
          filter: invert(1) contrast(200%);
        }
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
}
</style>

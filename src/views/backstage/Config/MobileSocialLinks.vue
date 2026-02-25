<template>
  <div class="mobile-social-links">
    <!-- 新增按钮 -->
    <div class="action-bar">
      <el-button
        type="primary"
        :icon="Plus"
        @click="handleAdd"
      >
        新增链接
      </el-button>
    </div>

    <!-- 社交链接列表 -->
    <div
      v-loading="loading"
      class="social-list"
    >
      <div
        v-for="item in socialList"
        :key="item.socialLinkId"
        class="social-item"
      >
        <div class="social-header">
          <div class="social-info">
            <div class="icon-wrapper">
              <i
                v-if="item.icon.startsWith('el-icon-')"
                :class="item.icon"
              />
              <img
                v-else-if="item.icon.startsWith('/') || item.icon.startsWith('http')"
                :src="item.icon"
                class="icon-img"
              >
              <span v-else>{{ item.icon }}</span>
            </div>
            <div class="social-meta">
              <span class="social-name">{{ item.name }}</span>
              <span class="social-tip">{{ item.tip || '无提示文本' }}</span>
            </div>
          </div>
          <el-switch
            v-model="item.status"
            active-value="1"
            inactive-value="0"
            @change="handleStatusChange(item)"
          />
        </div>
        <div class="social-body">
          <div class="url-row">
            <el-icon><Link /></el-icon>
            <span class="url-text">{{ item.url }}</span>
          </div>
          <div class="sort-row">
            <span class="sort-label">排序</span>
            <span class="sort-value">{{ item.sortOrder }}</span>
          </div>
        </div>
        <div class="social-footer">
          <el-button
            type="primary"
            link
            size="small"
            :icon="Edit"
            @click="handleEdit(item)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            link
            size="small"
            :icon="Delete"
            @click="handleDelete(item)"
          >
            删除
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="!loading && socialList.length === 0"
        class="empty-state"
      >
        <el-icon class="empty-icon">
          <Link />
        </el-icon>
        <p class="empty-text">
          暂无社交链接
        </p>
        <el-button
          type="primary"
          @click="handleAdd"
        >
          新增第一个链接
        </el-button>
      </div>
    </div>

    <!-- 编辑抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      size="90%"
      direction="btt"
      destroy-on-close
    >
      <el-form
        :model="socialForm"
        label-position="top"
      >
        <el-form-item
          label="名称"
          required
        >
          <el-input
            v-model="socialForm.name"
            placeholder="请输入社交平台名称"
          />
        </el-form-item>
        <el-form-item
          label="图标方式"
          required
        >
          <el-radio-group v-model="iconType">
            <el-radio label="class">
              图标类名
            </el-radio>
            <el-radio label="upload">
              本地上传
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="图标内容"
          required
        >
          <el-input
            v-if="iconType === 'class'"
            v-model="socialForm.icon"
            placeholder="例如: /images/icon/github.png"
          />
          <div
            v-else
            class="upload-hint"
          >
            <el-icon><InfoFilled /></el-icon>
            <span>上传接口暂未实现，请先使用预设图标或类名</span>
          </div>
        </el-form-item>
        <el-form-item label="提示文本">
          <el-input
            v-model="socialForm.tip"
            placeholder="请输入悬浮提示文本"
          />
        </el-form-item>
        <el-form-item
          label="链接地址"
          required
        >
          <el-input
            v-model="socialForm.url"
            placeholder="请输入跳转链接"
          />
        </el-form-item>
        <el-form-item label="排序序号">
          <el-input-number
            v-model="socialForm.sortOrder"
            :min="0"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="submitSocialForm"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getSocialLink, addSocial, updateSocial, deleteSocial, updateSocialStatus } from '@/api/backstage/socialLink'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Link, InfoFilled } from '@element-plus/icons-vue'

const loading = ref(false)
const socialList = ref([])
const drawerVisible = ref(false)
const drawerTitle = ref('')
const iconType = ref('class')

const socialForm = reactive({
  socialLinkId: undefined,
  name: '',
  icon: '',
  tip: '',
  url: '',
  sortOrder: 0
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
  drawerTitle.value = '新增社交链接'
  iconType.value = 'class'
  Object.assign(socialForm, {
    socialLinkId: undefined,
    name: '',
    icon: '',
    tip: '',
    url: '',
    sortOrder: 0
  })
  drawerVisible.value = true
}

const handleEdit = (row) => {
  drawerTitle.value = '编辑社交链接'
  iconType.value = 'class'
  Object.assign(socialForm, {
    socialLinkId: row.socialLinkId,
    name: row.name,
    icon: row.icon,
    tip: row.tip,
    url: row.url,
    sortOrder: row.sortOrder
  })
  drawerVisible.value = true
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
    row.status = row.status === '1' ? '0' : '1'
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
    drawerVisible.value = false
    fetchSocialLinks()
  } catch (error) {
    console.error('保存社交链接失败:', error)
  }
}

onMounted(() => {
  fetchSocialLinks()
})

defineExpose({
  fetchSocialLinks
})
</script>

<style lang="scss" scoped>
.mobile-social-links {
  padding: 12px;
  background: var(--backstage-bg-color);
  min-height: 100vh;

  .action-bar {
    margin-bottom: 16px;

    .el-button {
      width: 100%;
    }
  }

  .social-list {
    .social-item {
      background: var(--backstage-card-bg);
      border-radius: var(--backstage-radius-lg);
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: var(--backstage-shadow-light);

      .social-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--backstage-border-color);

        .social-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .icon-wrapper {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: var(--backstage-border-lighter);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;

            .icon-img {
              width: 24px;
              height: 24px;
              object-fit: contain;
            }
          }

          .social-meta {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .social-name {
              font-size: 15px;
              font-weight: 600;
              color: var(--backstage-text-primary);
            }

            .social-tip {
              font-size: 12px;
              color: var(--backstage-text-secondary);
            }
          }
        }
      }

      .social-body {
        margin-bottom: 12px;

        .url-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 13px;
          color: var(--backstage-text-regular);

          .el-icon {
            font-size: 14px;
            color: var(--backstage-text-secondary);
          }

          .url-text {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .sort-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;

          .sort-label {
            color: var(--backstage-text-secondary);
          }

          .sort-value {
            color: var(--backstage-primary);
            font-weight: 600;
          }
        }
      }

      .social-footer {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        padding-top: 12px;
        border-top: 1px solid var(--backstage-border-color);
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: var(--backstage-text-placeholder);

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 16px;
      margin-bottom: 24px;
    }
  }

  .upload-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: var(--backstage-border-lighter);
    border-radius: var(--backstage-radius-md);
    font-size: 13px;
    color: var(--backstage-text-secondary);

    .el-icon {
      font-size: 16px;
      color: var(--backstage-warning);
    }
  }

  .drawer-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
}
</style>

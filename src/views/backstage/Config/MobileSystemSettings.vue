<template>
  <div class="mobile-system-settings">
    <!-- 新增按钮 -->
    <div class="action-bar">
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增配置</el-button>
    </div>

    <!-- 配置列表 -->
    <div class="config-list" v-loading="loading">
      <div
        v-for="config in configList"
        :key="config.configId"
        class="config-item"
        @click="handleEdit(config)"
      >
        <div class="config-header">
          <div class="config-title">
            <el-icon class="config-icon"><Setting /></el-icon>
            <span class="config-name">{{ config.configName }}</span>
          </div>
          <el-icon class="delete-btn" @click.stop="handleDelete(config)"><Delete /></el-icon>
        </div>
        <div class="config-body">
          <div class="config-row">
            <span class="row-label">键名</span>
            <span class="row-value key-text">{{ config.configKey }}</span>
          </div>
          <div class="config-row">
            <span class="row-label">参数值</span>
            <span class="row-value value-text">{{ config.configValue }}</span>
          </div>
          <div class="config-row" v-if="config.remark">
            <span class="row-label">备注</span>
            <span class="row-value remark-text">{{ config.remark }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && configList.length === 0" class="empty-state">
        <el-icon class="empty-icon"><FolderOpened /></el-icon>
        <p class="empty-text">暂无系统配置</p>
        <el-button type="primary" @click="handleAdd">新增第一个配置</el-button>
      </div>
    </div>

    <!-- 配置编辑抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      size="90%"
      direction="btt"
      destroy-on-close
    >
      <el-form :model="configForm" :rules="formRules" ref="formRef" label-position="top">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="configForm.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input
            v-model="configForm.configKey"
            placeholder="请输入参数键名（需唯一）"
            :disabled="isEdit"
          />
          <div class="form-tip">参数键名用于系统识别，创建后不可修改</div>
        </el-form-item>
        <el-form-item label="参数值" prop="configValue">
          <el-input
            v-model="configForm.configValue"
            type="textarea"
            :rows="4"
            placeholder="请输入参数值"
          />
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input
            v-model="configForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getSysConfig, addSysConfig, updateSysConfig, deleteSysConfig } from '@/api/backstage/sysConfig'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Setting, Delete, FolderOpened } from '@element-plus/icons-vue'

const loading = ref(false)
const configList = ref([])
const drawerVisible = ref(false)
const drawerTitle = ref('')
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const configForm = reactive({
  configId: undefined,
  configName: '',
  configKey: '',
  configValue: '',
  remark: ''
})

const formRules = {
  configName: [
    { required: true, message: '请输入参数名称', trigger: 'blur' }
  ],
  configKey: [
    { required: true, message: '请输入参数键名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_.-]+$/, message: '参数键名只能包含字母、数字、下划线、点和横线', trigger: 'blur' }
  ]
}

// 加载配置列表
const fetchConfigList = async () => {
  loading.value = true
  try {
    const res = await getSysConfig()
    configList.value = res.data || []
  } catch (error) {
    console.error('获取系统配置失败:', error)
    ElMessage.error('获取系统配置失败')
  } finally {
    loading.value = false
  }
}

// 新增配置
const handleAdd = () => {
  drawerTitle.value = '新增系统配置'
  isEdit.value = false
  Object.assign(configForm, {
    configId: undefined,
    configName: '',
    configKey: '',
    configValue: '',
    remark: ''
  })
  drawerVisible.value = true
}

// 编辑配置
const handleEdit = (row) => {
  drawerTitle.value = '编辑系统配置'
  isEdit.value = true
  Object.assign(configForm, {
    configId: row.configId,
    configName: row.configName,
    configKey: row.configKey,
    configValue: row.configValue,
    remark: row.remark || ''
  })
  drawerVisible.value = true
}

// 删除配置
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除配置 "${row.configName}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteSysConfig(row.configId)
      ElMessage.success('删除成功')
      fetchConfigList()
    } catch (error) {
      console.error('删除配置失败:', error)
    }
  }).catch(() => {})
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (isEdit.value) {
        await updateSysConfig(configForm)
        ElMessage.success('修改成功')
      } else {
        await addSysConfig(configForm)
        ElMessage.success('添加成功')
      }
      drawerVisible.value = false
      fetchConfigList()
    } catch (error) {
      console.error('保存配置失败:', error)
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  fetchConfigList()
})

defineExpose({
  fetchConfigList
})
</script>

<style lang="scss" scoped>
.mobile-system-settings {
  padding: 12px;
  background: var(--backstage-bg-color);
  min-height: 100vh;

  .action-bar {
    margin-bottom: 16px;

    .el-button {
      width: 100%;
    }
  }

  .config-list {
    .config-item {
      background: var(--backstage-card-bg);
      border-radius: var(--backstage-radius-lg);
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: var(--backstage-shadow-light);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .config-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--backstage-border-color);

        .config-title {
          display: flex;
          align-items: center;
          gap: 8px;

          .config-icon {
            font-size: 18px;
            color: var(--backstage-primary);
          }

          .config-name {
            font-size: 15px;
            font-weight: 600;
            color: var(--backstage-text-primary);
          }
        }

        .delete-btn {
          font-size: 18px;
          color: var(--backstage-danger);
          padding: 4px;
        }
      }

      .config-body {
        .config-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 10px;

          &:last-child {
            margin-bottom: 0;
          }

          .row-label {
            font-size: 12px;
            color: var(--backstage-text-secondary);
          }

          .row-value {
            font-size: 13px;
            color: var(--backstage-text-primary);
            word-break: break-all;
            line-height: 1.5;

            &.key-text {
              font-family: 'Consolas', monospace;
              color: var(--backstage-primary);
              background: var(--backstage-border-lighter);
              padding: 6px 10px;
              border-radius: 4px;
            }

            &.value-text {
              color: var(--backstage-text-regular);
            }

            &.remark-text {
              color: var(--backstage-text-secondary);
              font-style: italic;
            }
          }
        }
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

  .form-tip {
    font-size: 12px;
    color: var(--backstage-text-secondary);
    margin-top: 4px;
  }

  .drawer-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
}
</style>

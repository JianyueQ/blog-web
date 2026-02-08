<template>
  <div class="system-settings-panel">
    <div class="pro-card">
      <div class="card-header-actions">
        <el-button type="primary" icon="Plus" round @click="handleAdd">新增配置</el-button>
      </div>
      <div class="card-body">
        <!-- 配置卡片网格 -->
        <div class="config-grid" v-loading="loading">
          <div
            v-for="config in configList"
            :key="config.configId"
            class="config-card"
            @click="handleEdit(config)"
          >
            <div class="config-card-header">
              <div class="config-name">
                <el-icon class="config-icon"><Setting /></el-icon>
                <span>{{ config.configName }}</span>
              </div>
              <div class="config-actions" @click.stop>
                <el-button
                  type="danger"
                  text
                  icon="Delete"
                  @click="handleDelete(config)"
                  title="删除配置"
                />
              </div>
            </div>
            <div class="config-card-body">
              <div class="config-item">
                <span class="config-label">参数键名</span>
                <span class="config-value config-key">{{ config.configKey }}</span>
              </div>
              <div class="config-item">
                <span class="config-label">参数值</span>
                <span class="config-value" :title="config.configValue">{{ config.configValue }}</span>
              </div>
              <div class="config-item" v-if="config.remark">
                <span class="config-label">备注</span>
                <span class="config-value config-remark">{{ config.remark }}</span>
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
      </div>
    </div>

    <!-- 配置编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="550px"
      append-to-body
      destroy-on-close
      class="theme-dialog"
    >
      <el-form :model="configForm" :rules="formRules" ref="formRef" label-width="100px" label-position="left">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="configForm.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input
            v-model="configForm.configKey"
            placeholder="请输入参数键名（需唯一）"
            :disabled="isEdit"
          />
          <template #extra>
            <span class="form-tip">参数键名用于系统识别，创建后不可修改</span>
          </template>
        </el-form-item>
        <el-form-item label="参数值" prop="configValue">
          <el-input
            v-model="configForm.configValue"
            type="textarea"
            :rows="3"
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
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getSysConfig, addSysConfig, updateSysConfig, deleteSysConfig } from '@/api/backstage/sysConfig'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting, Delete, FolderOpened } from '@element-plus/icons-vue'

const loading = ref(false)
const configList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
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
  dialogTitle.value = '新增系统配置'
  isEdit.value = false
  Object.assign(configForm, {
    configId: undefined,
    configName: '',
    configKey: '',
    configValue: '',
    remark: ''
  })
  dialogVisible.value = true
}

// 编辑配置
const handleEdit = (row) => {
  dialogTitle.value = '编辑系统配置'
  isEdit.value = true
  Object.assign(configForm, {
    configId: row.configId,
    configName: row.configName,
    configKey: row.configKey,
    configValue: row.configValue,
    remark: row.remark || ''
  })
  dialogVisible.value = true
}

// 删除配置
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除配置 "${row.configName}" 吗？删除后将无法恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
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
      dialogVisible.value = false
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
</script>

<style scoped lang="scss">
.system-settings-panel {
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

  // 配置卡片网格
  .config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    min-height: 200px;
  }

  // 配置卡片
  .config-card {
    background: var(--backstage-card-bg);
    border: 2px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-lg);
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--backstage-primary);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
      transform: translateY(-2px);

      .config-actions {
        opacity: 1;
      }
    }

    .config-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--backstage-border-color);

      .config-name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: var(--backstage-text-primary);

        .config-icon {
          font-size: 18px;
          color: var(--backstage-primary);
        }
      }

      .config-actions {
        opacity: 0;
        transition: opacity 0.2s ease;
      }
    }

    .config-card-body {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .config-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .config-label {
          font-size: 12px;
          color: var(--backstage-text-placeholder);
          font-weight: 500;
        }

        .config-value {
          font-size: 14px;
          color: var(--backstage-text-primary);
          word-break: break-all;
          line-height: 1.5;

          &.config-key {
            font-family: 'Consolas', 'Monaco', monospace;
            color: var(--backstage-primary);
            font-weight: 500;
            background: var(--backstage-card-hover-bg);
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
          }

          &.config-remark {
            color: var(--backstage-text-secondary);
            font-size: 13px;
            font-style: italic;
          }
        }
      }
    }
  }

  // 空状态
  .empty-state {
    grid-column: 1 / -1;
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

  // 表单提示
  .form-tip {
    font-size: 12px;
    color: var(--backstage-text-placeholder);
    margin-top: 4px;
  }

  // 响应式
  @media (max-width: 768px) {
    .config-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>

<template>
  <div class="tag-manage">
    <div class="pro-card table-card">
      <div class="card-header">
        <div class="header-left">
          <span class="title">标签云管理</span>
          <span class="subtitle">管理文章关联的所有标签</span>
        </div>
        <div class="header-right">
          <el-button
            type="primary"
            round
            :icon="Plus"
            @click="handleAdd"
          >
            新增标签
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="tag-overview mb-20">
          <el-tag 
            v-for="tag in tableData" 
            :key="tag.id" 
            class="interactive-tag"
            closable
            @close="handleDelete(tag)"
            @click="handleEdit(tag)"
          >
            {{ tag.name }} ({{ tag.count }})
          </el-tag>
        </div>

        <el-table
          :data="tableData"
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            label="标签名称"
            min-width="150"
          />
          <el-table-column
            prop="count"
            label="使用频次"
            width="120"
            align="center"
            sortable
          >
            <template #default="scope">
              <span class="count-badge">{{ scope.row.count }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
            width="180"
          />
          <el-table-column
            label="操作"
            width="180"
            fixed="right"
          >
            <template #default="scope">
              <div class="button-row">
                <el-button
                  link
                  type="primary"
                  :icon="Edit"
                  @click="handleEdit(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  type="danger"
                  :icon="Delete"
                  @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

const tableData = ref([
  { id: 1, name: 'Vue3', count: 28, createTime: '2026-01-10 09:00:00' },
  { id: 2, name: 'Element Plus', count: 15, createTime: '2026-01-11 10:30:00' },
  { id: 3, name: 'UI 设计', count: 12, createTime: '2026-01-12 11:20:00' },
  { id: 4, name: 'Node.js', count: 8, createTime: '2026-01-13 14:15:00' },
  { id: 5, name: '性能优化', count: 22, createTime: '2026-01-14 16:40:00' }
])

const handleAdd = () => {
  // TODO: 使用 ElDialog 弹出新增标签表单
}

const handleEdit = () => {
  // TODO: 使用 ElDialog 弹出编辑标签表单
}

const handleDelete = () => {
  // TODO: 使用 ElMessageBox.confirm 确认删除标签
}
</script>

<style scoped lang="scss">
.tag-manage {
  .mb-20 { margin-bottom: 20px; }

  .pro-card {
    background: var(--backstage-card-bg);
    border: 1px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-xl);
    box-shadow: var(--backstage-shadow-light);
    
    .card-header {
      padding: 16px 24px;
      border-bottom: 1px solid var(--backstage-border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 16px;
        font-weight: 600;
        color: var(--backstage-text-primary);
      }
      .subtitle {
        font-size: 12px;
        color: var(--backstage-text-secondary);
        margin-left: 12px;
      }
    }
    
    .card-body {
      padding: 24px;
    }
  }

  .tag-overview {
    padding: 16px;
    background: var(--backstage-border-lighter);
    border-radius: var(--backstage-radius-lg);
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .interactive-tag {
      cursor: pointer;
      transition: all 0.2s;
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--backstage-shadow-light);
      }
    }
  }

  .count-badge {
    background: var(--backstage-primary-lighter);
    color: var(--backstage-primary);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
  }
}
</style>

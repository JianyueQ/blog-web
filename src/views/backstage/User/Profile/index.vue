<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <!-- 左侧：用户信息卡片 -->
      <el-col
        :xs="24"
        :md="8"
      >
        <div class="pro-card user-card">
          <div class="card-body">
            <div class="avatar-section">
              <div
                class="avatar-wrapper"
                @click="handleOpenCropper"
              >
                <el-avatar
                  :size="120"
                  :src="userStore.avatar || '/images/icon/logo.png'"
                />
                <div class="avatar-edit-overlay">
                  <el-icon><Camera /></el-icon>
                  <span>更换头像</span>
                </div>
              </div>
              <h2 class="nickname">
                {{ userStore.nickname }}
              </h2>
              <p class="username">
                {{ userStore.username }}
              </p>
            </div>

            <div class="user-meta">
              <div class="meta-item">
                <el-icon><Message /></el-icon>
                <span>{{ userStore.user?.email || '未绑定邮箱' }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>注册于 {{ userStore.user?.createTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧：设置面板 -->
      <el-col
        :xs="24"
        :md="16"
      >
        <div class="pro-card settings-card">
          <el-tabs
            v-model="activeTab"
            class="pro-tabs"
          >
            <el-tab-pane
              label="基本资料"
              name="basic"
            >
              <div class="pane-content">
                <el-form
                  :model="userForm"
                  label-position="top"
                  class="pro-form"
                >
                  <el-form-item label="用户昵称">
                    <el-input
                      v-model="userForm.nickname"
                      placeholder="请输入您的公开昵称"
                    />
                  </el-form-item>
                  <el-form-item label="电子邮箱">
                    <el-input
                      v-model="userForm.email"
                      placeholder="请输入您的常用邮箱"
                    />
                  </el-form-item>
                  <el-form-item label="个人简介">
                    <el-input
                      v-model="userForm.description"
                      type="textarea"
                      :rows="4"
                      placeholder="向大家介绍一下自己吧"
                    />
                  </el-form-item>
                  <div class="form-actions mt-20">
                    <el-button
                      type="primary"
                      round
                      @click="handleUpdateProfile"
                    >
                      保存基本资料
                    </el-button>
                  </div>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane
              label="账户安全"
              name="security"
            >
              <div class="pane-content">
                <div class="security-list">
                  <div class="security-item">
                    <div class="item-info">
                      <div class="item-title">
                        登录密码
                      </div>
                      <div class="item-desc">
                        定期更换密码可以提高账户安全性
                      </div>
                    </div>
                    <el-button
                      round
                      @click="handleOpenResetPwd"
                    >
                      修改密码
                    </el-button>
                  </div>
                  <div class="security-item">
                    <div class="item-info">
                      <div class="item-title">
                        双重身份验证
                      </div>
                      <div class="item-desc">
                        未开启
                      </div>
                    </div>
                    <el-button
                      link
                      type="primary"
                    >
                      立即开启
                    </el-button>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
    </el-row>

    <!-- 头像裁剪对话框 -->
    <AvatarCropper
      ref="cropperRef"
      @success="handleAvatarSuccess"
    />

    <!-- 修改密码对话框 -->
    <ResetPwd ref="resetPwdRef" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Camera, Message, Calendar } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import AvatarCropper from './AvatarCropper.vue'
import ResetPwd from './ResetPwd.vue'
import {updateProfile} from "@/api/backstage/admin.js";
import {ElMessage} from "element-plus";

const userStore = useUserStore()
const activeTab = ref('basic')
const cropperRef = ref(null)
const resetPwdRef = ref(null)

const userForm = reactive({
  nickname: '',
  email: '',
  description: ''
})

onMounted(() => {
  if (userStore.user) {
    userForm.nickname = userStore.user.nickname
    userForm.email = userStore.user.email
    userForm.description = userStore.user.description
  }
})

const handleOpenCropper = () => {
  cropperRef.value.open()
}

const handleOpenResetPwd = () => {
  resetPwdRef.value.open()



}

const handleUpdateProfile = () => {
  // TODO: 调用后端更新资料接口，完成后更新 store
  updateProfile(userForm).then((res) => {
    userStore.user.nickname = userForm.nickname
    userStore.user.email = userForm.email
    userStore.user.description = userForm.description
    // 弹窗提示
    ElMessage.success(res.message || '更新资料成功')
  }).catch(() => {

  })
}

const handleAvatarSuccess = (newAvatarUrl) => {
  if (newAvatarUrl) {
    userStore.user.avatar = newAvatarUrl
  }
}
</script>

<style scoped lang="scss">
.profile-container {
  .mt-20 { margin-top: 20px; }

  .pro-card {
    background: var(--backstage-card-bg);
    border: 1px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-xl);
    box-shadow: var(--backstage-shadow-light);
    height: 100%;
  }

  .user-card {
    .card-body {
      padding: 40px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .avatar-section {
      text-align: center;
      margin-bottom: 32px;

      .avatar-wrapper {
        position: relative;
        cursor: pointer;
        display: inline-block;
        border-radius: 50%;
        overflow: hidden;
        border: 4px solid var(--backstage-border-lighter);
        transition: all 0.3s;

        &:hover {
          border-color: var(--backstage-primary-light);
          .avatar-edit-overlay {
            opacity: 1;
          }
        }

        .avatar-edit-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 12px;
          gap: 4px;

          .el-icon {
            font-size: 24px;
          }
        }
      }

      .nickname {
        font-size: 20px;
        font-weight: 600;
        color: var(--backstage-text-primary);
        margin: 16px 0 4px;
      }

      .username {
        font-size: 14px;
        color: var(--backstage-text-placeholder);
      }
    }

    .user-meta {
      width: 100%;
      border-top: 1px solid var(--backstage-border-color);
      padding-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--backstage-text-regular);
        font-size: 14px;

        .el-icon {
          color: var(--backstage-text-placeholder);
          font-size: 18px;
        }
      }
    }
  }

  .settings-card {
    .pane-content {
      padding: 24px;
    }

    .pro-tabs {
      :deep(.el-tabs__header) {
        margin: 0;
        padding: 0 24px;
        border-bottom: 1px solid var(--backstage-border-color);
      }
      :deep(.el-tabs__nav-wrap::after) { display: none; }
      :deep(.el-tabs__item) {
        height: 56px;
        font-weight: 500;
      }
    }
  }

  .security-list {
    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid var(--backstage-border-lighter);

      &:last-child {
        border-bottom: none;
      }

      .item-info {
        .item-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--backstage-text-primary);
          margin-bottom: 4px;
        }
        .item-desc {
          font-size: 13px;
          color: var(--backstage-text-secondary);
        }
      }
    }
  }

  .pro-form {
    max-width: 600px;
  }
}
</style>

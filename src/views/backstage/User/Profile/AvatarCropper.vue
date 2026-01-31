<template>
  <el-dialog
    v-model="visible"
    title="更换头像"
    width="600px"
    class="pro-dialog avatar-dialog"
    append-to-body
    :close-on-click-modal="false"
  >
    <div class="cropper-container">
      <el-row :gutter="20">
        <el-col :span="16">
            <div class="cropper-main">
            <vue-cropper
              v-if="imageUrl"
              ref="cropper"
              :img="imageUrl"
              :info="true"
              :autoCrop="options.autoCrop"
              :autoCropWidth="options.autoCropWidth"
              :autoCropHeight="options.autoCropHeight"
              :fixedBox="options.fixedBox"
              :outputType="options.outputType"
              :centerBox="options.centerBox"
              @realTime="realTime"
            />
            <div class="cropper-upload-placeholder" v-else @click="triggerUpload">
              <el-icon><Plus /></el-icon>
              <span>选择图片</span>
            </div>
          </div>

          <div class="cropper-toolbar mt-20" v-if="imageUrl">
            <el-button-group class="button-row">
              <el-button :icon="ZoomIn" circle @click="handleZoom(0.1)" title="放大" />
              <el-button :icon="ZoomOut" circle @click="handleZoom(-0.1)" title="缩小" />
              <el-button :icon="RefreshLeft" circle @click="handleRotate(-90)" title="左旋转" />
              <el-button :icon="RefreshRight" circle @click="handleRotate(90)" title="右旋转" />
            </el-button-group>
            <el-button link type="primary" @click="triggerUpload">重新选择</el-button>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="preview-section">
            <div class="preview-label">预览</div>
            <div class="preview-list">
              <div class="preview-item circle">
                <div class="preview-img-wrapper">
                  <div v-if="previews.url" class="preview-cropper">
                    <div :style="previewStyle">
                      <div :style="previews.div">
                        <img :src="previews.url" :style="previews.img" />
                      </div>
                    </div>
                  </div>
<!--                  <img v-else src="/images/icon/logo.png" class="default-avatar" />-->
                </div>
                <span>120x120</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <template #footer>
      <div class="dialog-footer button-row">
        <el-button round @click="visible = false">取消</el-button>
        <el-button round type="primary" :disabled="!imageUrl" @click="handleSave">确认保存</el-button>
      </div>
    </template>

    <input type="file" ref="fileInput" hidden accept="image/*" @change="onFileChange" />
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus, ZoomIn, ZoomOut, RefreshLeft, RefreshRight } from '@element-plus/icons-vue'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import { uploadAvatar } from '@/api/backstage/admin'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const imageUrl = ref('')
const fileInput = ref(null)
const cropper = ref(null)
const previews = ref({})

const options = reactive({
  autoCrop: true,
  autoCropWidth: 200,
  autoCropHeight: 200,
  fixedBox: true,
  outputType: 'png',
  centerBox: true
})

const previewStyle = computed(() => {
  if (!previews.value.url) return {}
  return {
    width: previews.value.w + 'px',
    height: previews.value.h + 'px',
    overflow: 'hidden',
    zoom: 120 / previews.value.w
  }
})

const open = () => {
  visible.value = true
  imageUrl.value = ''
  previews.value = {}
}

const triggerUpload = () => {
  fileInput.value.click()
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  // 重置 input 值，确保同文件可再次触发
  e.target.value = ''

  if (!file.type.includes('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    imageUrl.value = event.target.result
  }
  reader.readAsDataURL(file)
}

const handleZoom = (val) => {
  cropper.value.changeScale(val > 0 ? 1 : -1)
}

const handleRotate = (deg) => {
  if (deg > 0) {
    cropper.value.rotateRight()
  } else {
    cropper.value.rotateLeft()
  }
}

const realTime = (data) => {
  previews.value = data
}

const handleSave = () => {
  cropper.value.getCropBlob((blob) => {
    const formData = new FormData()
    formData.append('avatarfile', blob, 'avatar.png')
    uploadAvatar(formData).then(res => {
      ElMessage.success('头像上传成功')
      emit('success', res.imgUrl)
      visible.value = false
    }).catch(err => {

    })
  })
}

const emit = defineEmits(['success'])

defineExpose({ open })
</script>

<style scoped lang="scss">
.avatar-dialog {
  :deep(.el-dialog__body) {
    padding: 30px;
  }
}

.cropper-container {
  .cropper-main {
    height: 340px;
    background: #f8f8f8;
    border-radius: var(--backstage-radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    border: 1px solid var(--backstage-border-color);

    .cropper-upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--backstage-text-placeholder);
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        color: var(--backstage-primary);
      }

      .el-icon {
        font-size: 48px;
      }
    }
  }

  .cropper-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .preview-section {
    padding-left: 10px;
    .preview-label {
      font-size: 14px;
      color: var(--backstage-text-secondary);
      margin-bottom: 20px;
    }

    .preview-list {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;

      .preview-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .preview-img-wrapper {
          background: #eee;
          overflow: hidden;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          .preview-cropper {
            overflow: hidden;
          }

          .default-avatar {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        span {
          font-size: 12px;
          color: var(--backstage-text-placeholder);
        }
      }
    }
  }
}

.mt-20 { margin-top: 20px; }

[data-theme='dark'] {
  .cropper-main {
    background: #1a1a1a;
    border-color: #333;
  }
}
</style>

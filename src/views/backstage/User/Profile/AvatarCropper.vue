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
            <!-- 模拟裁剪区域，由于无法安装 vue-cropper，这里提供一个结构化 UI -->
            <div class="cropper-box" v-if="imageUrl">
              <img :src="imageUrl" :style="imgStyle" alt="Cropper" />
              <div class="cropper-face"></div>
            </div>
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
                  <img :src="imageUrl || '/images/icon/logo.png'" :style="imgStyle" />
                </div>
                <span>120x120</span>
              </div>
              <div class="preview-item small circle">
                <div class="preview-img-wrapper">
                  <img :src="imageUrl || '/images/icon/logo.png'" :style="imgStyle" />
                </div>
                <span>48x48</span>
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

const visible = ref(false)
const imageUrl = ref('')
const fileInput = ref(null)

const transform = reactive({
  scale: 1,
  rotate: 0
})

const imgStyle = computed(() => ({
  transform: `scale(${transform.scale}) rotate(${transform.rotate}deg)`,
  transition: 'all 0.2s'
}))

const open = () => {
  visible.value = true
  transform.scale = 1
  transform.rotate = 0
}

const triggerUpload = () => {
  fileInput.value.click()
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      imageUrl.value = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleZoom = (val) => {
  transform.scale = Math.max(0.5, Math.min(3, transform.scale + val))
}

const handleRotate = (deg) => {
  transform.rotate += deg
}

const handleSave = () => {
  // TODO: 实际裁剪逻辑通常需要 canvas 转换或 vue-cropper 获取 blob
  // 这里模拟保存并触发 success 事件
  emit('success', imageUrl.value)
  visible.value = false
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

    .cropper-box {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-image: linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee 100%), 
                        linear-gradient(45deg, #eee 25%, white 25%, white 75%, #eee 75%, #eee 100%);
      background-size: 20px 20px;
      background-position: 0 0, 10px 10px;

      img {
        max-width: 100%;
        max-height: 100%;
      }

      .cropper-face {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 200px;
        height: 200px;
        border-radius: 50%;
        box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.5);
        border: 2px solid var(--backstage-primary);
        pointer-events: none;
      }
    }

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
          display: flex;
          align-items: center;
          justify-content: center;
          
          img {
            max-width: 100%;
            max-height: 100%;
          }
        }

        &.circle .preview-img-wrapper {
          border-radius: 50%;
        }

        &:not(.small) .preview-img-wrapper {
          width: 120px;
          height: 120px;
        }

        &.small .preview-img-wrapper {
          width: 48px;
          height: 48px;
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

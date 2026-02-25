<template>
  <div class="time-capsule">
    <div class="capsule-header-main">
      <h3 class="capsule-title">
        时光胶囊
      </h3>
      <div class="capsule-subtitle">
        {{ currentSubtitle }}
      </div>
    </div>

    <div class="capsule-grid">
      <div
        v-for="(item, key) in timeCapsule"
        :key="key"
        class="capsule-item"
      >
        <div class="capsule-header">
          <span class="capsule-name">{{ item.name }}</span>
          <span class="capsule-percentage">{{ item.percentage }}%</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${item.percentage}%` }"
          />
        </div>
        <div class="capsule-info">
          <span>已过 <b>{{ item.passed }}</b> / 共 {{ item.total }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTimeCapsule } from '@/utils/getTime.js'

const timeCapsule = ref({})
const currentSubtitle = ref('')

const subtitles = [
  '盛年不重来，一日难再晨。及时当勉励，岁月不待人。 —— 陶渊明 《杂诗》',
  '莫等闲，白了少年头，空悲切。 —— 岳飞 《满江红》',
  '夫天地者，万物之逆旅也；光阴者，百代之过客也。 —— 李白 《春夜宴从弟桃花园序》',
  '流光容易把人抛，红了樱桃，绿了芭蕉。 —— 蒋捷 《贺新郎》',
  '少壮不努力，老大徒伤悲。 —— 《汉乐府·长歌行》 《长歌行》',
  '一寸光阴一寸金，寸金难买寸光阴。 —— 王贞白 《劝学诗》',
  '公道世间唯白发，贵人头上不曾饶。 —— 杜牧 《秋夕》',
  '逝者如斯夫，不舍昼夜。 —— 孔子 《论语·述而》',
  '昨日复昨日，昨日何其多。 —— 钱福 《明日歌》',
  '劝君莫惜金缕衣，劝君惜取少年时。 —— 杜秋娘 《金缕衣》'
]

onMounted(() => {
  timeCapsule.value = getTimeCapsule()
  currentSubtitle.value = subtitles[Math.floor(Math.random() * subtitles.length)]

  // 每分钟更新一次
  setInterval(() => {
    timeCapsule.value = getTimeCapsule()
  }, 60000)
})
</script>

<style lang="scss" scoped>
.time-capsule {
  font-family: 'Space Grotesk', sans-serif;
  padding: 3rem;
  background: rgba(24, 24, 27, 0.4);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  animation-delay: 0.4s;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: rgba(24, 24, 27, 0.5);
    border-color: rgba(37, 99, 235, 0.2);
  }

  .capsule-header-main {
    text-align: left;
    margin-bottom: 2.5rem;

    .capsule-title {
      font-family: 'Archivo', sans-serif;
      font-size: 1.8rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .capsule-subtitle {
      font-size: 0.9rem;
      color: #71717a;
      font-weight: 400;
    }
  }

  .capsule-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;

    @media (max-width: 720px) {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }

  .capsule-item {
    padding: 1.8rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      background: rgba(255, 255, 255, 0.06);
      transform: translateY(-5px);
      border-color: rgba(255, 255, 255, 0.1);

      .progress-fill {
        background: #2563eb;
        box-shadow: 0 0 15px rgba(37, 99, 235, 0.5);
      }
    }

    .capsule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      .capsule-name {
        font-size: 1rem;
        font-weight: 600;
        color: #e4e4e7;
      }

      .capsule-percentage {
        font-family: 'Archivo', sans-serif;
        font-size: 1.2rem;
        font-weight: 700;
        color: #fff;
      }
    }

    .progress-bar {
      width: 100%;
      height: 10px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      overflow: hidden;
      margin-bottom: 1rem;

      .progress-fill {
        height: 100%;
        background: #3f3f46;
        border-radius: 20px;
        transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      }
    }

    .capsule-info {
      font-size: 0.8rem;
      color: #71717a;
      text-align: left;

      b {
        color: #d4d4d8;
        font-weight: 500;
      }
    }
  }

  @media (max-width: 720px) {
    padding: 2rem;

    .capsule-header-main .capsule-title {
      font-size: 1.5rem;
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

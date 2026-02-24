<template>
  <div class="archive-view">
    <div class="archive-header">
      <h1 class="page-title">文章</h1>
      <p class="page-subtitle">记录成长的每一步</p>
      <div class="archive-stats">
        <span class="stat-item">共 {{ totalPosts }} 篇文章</span>
      </div>
    </div>

    <div class="archive-timeline">
      <div
        v-for="(posts, year) in groupedPosts"
        :key="year"
        class="year-group"
      >
        <div class="year-title">{{ year }}</div>

        <div class="posts-list">
          <div
            v-for="post in posts"
            :key="post.id"
            class="post-item"
            @click="goToPost(post)"
          >
            <div class="post-dot"></div>
            <div class="post-content">
              <div class="post-date">{{ post.date }}</div>
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-desc">{{ post.description }}</p>
              <div class="post-tags">
                <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <BackToTop />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BackToTop from '@/components/BackToTop.vue'

// 示例数据，实际项目中应该从API获取
const posts = ref([])

const totalPosts = computed(() => posts.value.length)

const groupedPosts = computed(() => {
  const grouped = {}
  posts.value.forEach(post => {
    if (!grouped[post.year]) {
      grouped[post.year] = []
    }
    grouped[post.year].push(post)
  })
  return grouped
})

const goToPost = (post) => {
  console.log('Navigate to post:', post)
  // 实际项目中跳转到文章详情页
}
</script>

<style lang="scss" scoped>
.archive-view {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 0;

  .archive-header {
    text-align: center;
    margin-bottom: 4rem;
    animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);

    .page-title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 1.5rem;
    }

    .archive-stats {
      display: flex;
      justify-content: center;
      gap: 2rem;

      .stat-item {
        padding: 0.5rem 1.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  .archive-timeline {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 20px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.3) 0%,
        rgba(255, 255, 255, 0.1) 100%
      );
    }

    .year-group {
      margin-bottom: 3rem;
      animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      animation-fill-mode: both;

      @for $i from 1 through 10 {
        &:nth-child(#{$i}) {
          animation-delay: #{0.1 + $i * 0.05}s;
        }
      }

      .year-title {
        font-size: 2rem;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.95);
        margin-bottom: 2rem;
        margin-left: 60px;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: -50px;
          top: 50%;
          transform: translateY(-50%);
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.2);
        }
      }

      .posts-list {
        .post-item {
          position: relative;
          margin-left: 60px;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(5px);
            border-color: rgba(255, 255, 255, 0.2);
          }

          .post-dot {
            position: absolute;
            left: -50px;
            top: 2rem;
            width: 8px;
            height: 8px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            transition: all 0.3s;
          }

          &:hover .post-dot {
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
          }

          .post-content {
            .post-date {
              font-size: 0.85rem;
              color: rgba(255, 255, 255, 0.5);
              margin-bottom: 0.5rem;
            }

            .post-title {
              font-size: 1.3rem;
              font-weight: 600;
              color: rgba(255, 255, 255, 0.95);
              margin-bottom: 0.5rem;
            }

            .post-desc {
              font-size: 0.95rem;
              color: rgba(255, 255, 255, 0.6);
              line-height: 1.6;
              margin-bottom: 1rem;
            }

            .post-tags {
              display: flex;
              gap: 0.5rem;
              flex-wrap: wrap;

              .tag {
                padding: 0.3rem 0.8rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                font-size: 0.8rem;
                color: rgba(255, 255, 255, 0.8);
              }
            }
          }
        }
      }
    }
  }

  @media (max-width: 720px) {
    padding: 1rem 0;

    .archive-header {
      margin-bottom: 3rem;

      .page-title {
        font-size: 2.2rem;
      }

      .page-subtitle {
        font-size: 1rem;
      }
    }

    .archive-timeline {
      &::before {
        left: 10px;
      }

      .year-group {
        .year-title {
          font-size: 1.6rem;
          margin-left: 40px;

          &::before {
            left: -36px;
            width: 10px;
            height: 10px;
          }
        }

        .posts-list .post-item {
          margin-left: 40px;
          padding: 1.2rem;

          .post-dot {
            left: -37px;
            width: 6px;
            height: 6px;
          }
        }
      }
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

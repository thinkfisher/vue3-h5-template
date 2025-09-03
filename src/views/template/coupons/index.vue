<template>
  <div class="coupons-page">
    <!-- 导航栏 -->
    <van-nav-bar
      title="我的优惠券"
      left-arrow
      class="fixed-nav"
      @click-left="goBack"
    />

    <!-- 状态筛选标签 -->
    <div class="status-tabs">
      <van-tabs v-model:active="activeTab" @change="onTabChange">
        <van-tab title="全部" name="all">
          <div class="tab-content">
            <div class="coupon-list">
              <div
                v-for="coupon in filteredCoupons"
                :key="coupon.id"
                class="coupon-item"
                :class="{ 'coupon-expired': coupon.status === 'expired' }"
              >
                <div class="coupon-left">
                  <div class="coupon-amount">
                    <span class="amount-symbol">¥</span>
                    <span class="amount-value">{{ coupon.amount }}</span>
                  </div>
                  <div class="coupon-condition">
                    满{{ coupon.condition }}可用
                  </div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-title">{{ coupon.title }}</div>
                  <div class="coupon-desc">{{ coupon.description }}</div>
                  <div class="coupon-validity">
                    有效期至：{{ coupon.validUntil }}
                  </div>
                  <div class="coupon-status">
                    <van-tag :type="getStatusType(coupon.status)" size="small">
                      {{ getStatusText(coupon.status) }}
                    </van-tag>
                  </div>
                </div>
                <div v-if="coupon.status === 'valid'" class="coupon-use-btn">
                  <van-button
                    type="primary"
                    size="small"
                    @click="useCoupon(coupon)"
                  >
                    立即使用
                  </van-button>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="可使用" name="valid">
          <div class="tab-content">
            <div class="coupon-list">
              <div
                v-for="coupon in filteredCoupons"
                :key="coupon.id"
                class="coupon-item"
              >
                <div class="coupon-left">
                  <div class="coupon-amount">
                    <span class="amount-symbol">¥</span>
                    <span class="amount-value">{{ coupon.amount }}</span>
                  </div>
                  <div class="coupon-condition">
                    满{{ coupon.condition }}可用
                  </div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-title">{{ coupon.title }}</div>
                  <div class="coupon-desc">{{ coupon.description }}</div>
                  <div class="coupon-validity">
                    有效期至：{{ coupon.validUntil }}
                  </div>
                  <div class="coupon-status">
                    <van-tag type="success" size="small">可使用</van-tag>
                  </div>
                </div>
                <div class="coupon-use-btn">
                  <van-button
                    type="primary"
                    size="small"
                    @click="useCoupon(coupon)"
                  >
                    立即使用
                  </van-button>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="已使用" name="used">
          <div class="tab-content">
            <div class="coupon-list">
              <div
                v-for="coupon in filteredCoupons"
                :key="coupon.id"
                class="coupon-item coupon-used"
              >
                <div class="coupon-left">
                  <div class="coupon-amount">
                    <span class="amount-symbol">¥</span>
                    <span class="amount-value">{{ coupon.amount }}</span>
                  </div>
                  <div class="coupon-condition">
                    满{{ coupon.condition }}可用
                  </div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-title">{{ coupon.title }}</div>
                  <div class="coupon-desc">{{ coupon.description }}</div>
                  <div class="coupon-validity">
                    使用时间：{{ coupon.usedAt }}
                  </div>
                  <div class="coupon-status">
                    <van-tag type="default" size="small">已使用</van-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="已过期" name="expired">
          <div class="tab-content">
            <div class="coupon-list">
              <div
                v-for="coupon in filteredCoupons"
                :key="coupon.id"
                class="coupon-item coupon-expired"
              >
                <div class="coupon-left">
                  <div class="coupon-amount">
                    <span class="amount-symbol">¥</span>
                    <span class="amount-value">{{ coupon.amount }}</span>
                  </div>
                  <div class="coupon-condition">
                    满{{ coupon.condition }}可用
                  </div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-title">{{ coupon.title }}</div>
                  <div class="coupon-desc">{{ coupon.description }}</div>
                  <div class="coupon-validity">
                    已过期：{{ coupon.validUntil }}
                  </div>
                  <div class="coupon-status">
                    <van-tag type="default" size="small">已过期</van-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 空状态 -->
    <van-empty
      v-if="filteredCoupons.length === 0"
      description="暂无优惠券"
      image="https://img.yzcdn.cn/vant/empty-image-default.png"
    />
  </div>
</template>

<script setup name="Coupons">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showSuccessToast } from "vant";

const router = useRouter();
const activeTab = ref("all");

// 优惠券数据
const coupons = ref([
  {
    id: 1,
    title: "新人专享券",
    description: "新用户专享优惠，全场通用",
    amount: 50,
    condition: 299,
    status: "valid",
    validUntil: "2024-12-31",
    usedAt: null
  },
  {
    id: 2,
    title: "满减优惠券",
    description: "满减优惠，限时特惠",
    amount: 30,
    condition: 199,
    status: "valid",
    validUntil: "2024-12-31",
    usedAt: null
  },
  {
    id: 3,
    title: "品类专享券",
    description: "指定品类商品专享优惠",
    amount: 20,
    condition: 99,
    status: "used",
    validUntil: "2024-12-31",
    usedAt: "2024-01-15 14:30"
  },
  {
    id: 4,
    title: "限时优惠券",
    description: "限时抢购专享优惠",
    amount: 100,
    condition: 599,
    status: "expired",
    validUntil: "2024-01-01",
    usedAt: null
  },
  {
    id: 5,
    title: "会员专享券",
    description: "VIP会员专享优惠券",
    amount: 80,
    condition: 399,
    status: "valid",
    validUntil: "2024-12-31",
    usedAt: null
  }
]);

// 根据标签筛选优惠券
const filteredCoupons = computed(() => {
  if (activeTab.value === "all") {
    return coupons.value;
  }
  return coupons.value.filter(coupon => coupon.status === activeTab.value);
});

// 标签切换事件
const onTabChange = name => {
  activeTab.value = name;
};

// 获取状态类型
const getStatusType = status => {
  const types = {
    valid: "success",
    used: "default",
    expired: "default"
  };
  return types[status] || "default";
};

// 获取状态文本
const getStatusText = status => {
  const texts = {
    valid: "可使用",
    used: "已使用",
    expired: "已过期"
  };
  return texts[status] || "未知";
};

// 使用优惠券
const useCoupon = coupon => {
  showSuccessToast(`已选择优惠券：${coupon.title}`);
  // 这里可以跳转到商品列表或购物车页面
  setTimeout(() => {
    router.push("/products");
  }, 1000);
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  // 页面加载完成后的逻辑
});
</script>

<style lang="less" scoped>
.coupons-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100px;
}

.fixed-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.status-tabs {
  background: white;

  .tab-content {
    padding: 16px;
  }
}

.coupon-list {
  .coupon-item {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 12px;
    margin-bottom: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.coupon-expired {
      opacity: 0.6;
      background: #f8f9fa;

      &::before {
        background: #ccc;
      }

      .coupon-left {
        .coupon-amount {
          color: #999;
        }
      }
    }

    &.coupon-used {
      opacity: 0.8;
      background: #f8f9fa;

      &::before {
        background: #28a745;
      }
    }

    .coupon-left {
      flex-shrink: 0;
      width: 100px;
      text-align: center;
      margin-right: 20px;

      .coupon-amount {
        margin-bottom: 8px;

        .amount-symbol {
          font-size: 16px;
          color: #ff4757;
          font-weight: 600;
        }

        .amount-value {
          font-size: 32px;
          color: #ff4757;
          font-weight: 700;
        }
      }

      .coupon-condition {
        font-size: 12px;
        color: #666;
        line-height: 1.3;
      }
    }

    .coupon-right {
      flex: 1;
      margin-right: 16px;

      .coupon-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 6px;
      }

      .coupon-desc {
        font-size: 13px;
        color: #666;
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .coupon-validity {
        font-size: 12px;
        color: #999;
        margin-bottom: 8px;
      }

      .coupon-status {
        display: flex;
        align-items: center;
      }
    }

    .coupon-use-btn {
      flex-shrink: 0;

      .van-button {
        border-radius: 20px;
        font-weight: 500;
      }
    }
  }
}

// 响应式设计
@media (max-width: 375px) {
  .coupon-item {
    padding: 16px;

    .coupon-left {
      width: 80px;
      margin-right: 16px;

      .coupon-amount {
        .amount-value {
          font-size: 28px;
        }
      }
    }

    .coupon-right {
      margin-right: 12px;

      .coupon-title {
        font-size: 15px;
      }
    }
  }
}
</style>

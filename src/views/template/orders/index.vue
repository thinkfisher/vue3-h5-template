<template>
  <div class="orders-page">
    <!-- 页面标题 -->
    <van-nav-bar
      title="我的订单"
      left-arrow
      class="fixed-nav"
      @click-left="goBack"
    />

    <!-- 订单状态标签页 -->
    <div class="order-tabs">
      <van-tabs v-model:active="activeStatus" @change="onStatusChange">
        <van-tab title="全部" name="all" />
        <van-tab title="待付款" name="pending" />
        <van-tab title="待发货" name="paid" />
        <van-tab title="待收货" name="shipped" />
        <van-tab title="已完成" name="completed" />
        <van-tab title="已取消" name="cancelled" />
      </van-tabs>
    </div>

    <!-- 订单列表 -->
    <div class="orders-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多订单了"
          @load="onLoad"
        >
          <div v-if="filteredOrders.length === 0" class="empty-orders">
            <van-empty description="暂无订单" />
          </div>

          <div v-else>
            <div
              v-for="order in filteredOrders"
              :key="order.id"
              class="order-item"
            >
              <!-- 订单头部 -->
              <div class="order-header">
                <div class="order-info">
                  <span class="order-number"
                    >订单号：{{ order.orderNumber }}</span
                  >
                  <span class="order-time">{{
                    formatTime(order.createTime)
                  }}</span>
                  <!-- 待付款订单显示倒计时 -->
                  <div
                    v-if="order.status === 'pending'"
                    class="countdown-timer"
                  >
                    <van-icon name="clock-o" />
                    <span class="countdown-text"
                      >支付剩余时间：{{
                        formatCountdown(countdowns.get(order.id) || 0)
                      }}</span
                    >
                  </div>
                </div>
                <div class="order-status" :class="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
                </div>
              </div>

              <!-- 订单商品 -->
              <div class="order-products">
                <div
                  v-for="item in order.items"
                  :key="item.id"
                  class="product-item"
                >
                  <div class="product-image">
                    <img :src="item.image" :alt="item.productName" />
                  </div>
                  <div class="product-info">
                    <div class="product-name">{{ item.productName }}</div>
                    <div v-if="item.specName" class="product-spec">
                      规格：{{ item.specName }}
                    </div>
                    <div class="product-price">
                      <span class="price">¥{{ item.price }}</span>
                      <span class="quantity">x{{ item.quantity }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 订单金额 -->
              <div class="order-amount">
                <span>共{{ getTotalQuantity(order.items) }}件商品</span>
                <span class="total-price"
                  >合计：¥{{ order.totalAmount.toFixed(2) }}</span
                >
              </div>

              <!-- 取消原因（如果订单已取消） -->
              <div
                v-if="order.status === 'cancelled' && order.cancelReason"
                class="cancel-reason"
              >
                <span class="cancel-label">取消原因：</span>
                <span class="cancel-text">{{
                  getCancelReasonText(order.cancelReason)
                }}</span>
                <span v-if="order.cancelTime" class="cancel-time">{{
                  formatTime(order.cancelTime)
                }}</span>
              </div>

              <!-- 订单操作 -->
              <div class="order-actions">
                <van-button
                  v-if="order.status === 'pending'"
                  type="primary"
                  size="small"
                  @click="payOrder(order)"
                >
                  立即付款
                </van-button>
                <van-button
                  v-if="order.status === 'pending'"
                  type="default"
                  size="small"
                  plain
                  @click="cancelOrder(order)"
                >
                  取消订单
                </van-button>
                <van-button
                  v-if="order.status === 'shipped'"
                  type="primary"
                  size="small"
                  @click="confirmReceive(order)"
                >
                  确认收货
                </van-button>
                <van-button
                  v-if="order.status === 'completed'"
                  type="default"
                  size="small"
                  @click="buyAgain(order)"
                >
                  再次购买
                </van-button>
                <van-button
                  v-if="order.status === 'cancelled'"
                  type="primary"
                  size="small"
                  @click="reorder(order)"
                >
                  重新下单
                </van-button>
                <van-button
                  v-if="order.status !== 'pending'"
                  type="default"
                  size="small"
                  plain
                  @click="viewOrderDetail(order)"
                >
                  查看详情
                </van-button>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>

  <!-- 取消订单弹框 -->
  <van-popup v-model:show="showCancelPopup" position="center" round>
    <div class="cancel-order-popup">
      <div class="popup-header">
        <div class="popup-title">取消订单</div>
        <div class="popup-subtitle">请选择取消原因</div>
      </div>

      <div class="cancel-reasons">
        <van-radio-group v-model="selectedCancelReason">
          <van-cell-group>
            <van-cell
              v-for="reason in cancelReasons"
              :key="reason.value"
              :title="reason.label"
              clickable
              @click="selectedCancelReason = reason.value"
            >
              <template #right-icon>
                <van-radio :name="reason.value" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>

      <div class="popup-actions">
        <van-button
          type="default"
          size="large"
          class="action-btn"
          @click="showCancelPopup = false"
        >
          继续支付
        </van-button>
        <van-button
          type="danger"
          size="large"
          class="action-btn"
          :disabled="!selectedCancelReason"
          @click="confirmCancelOrder"
        >
          确认取消
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup name="Orders">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { showSuccessToast, showFailToast, showConfirmDialog } from "vant";

const router = useRouter();
const activeStatus = ref("all");
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

// 倒计时相关
const countdownTimers = ref(new Map());
const countdowns = ref(new Map());

// 取消订单相关
const showCancelPopup = ref(false);
const selectedCancelReason = ref("");
const currentOrderToCancel = ref(null);

// 取消原因选项
const cancelReasons = [
  { value: "change_mind", label: "不想买了" },
  { value: "wrong_info", label: "信息填写错误" },
  { value: "duplicate_order", label: "重复下单" },
  { value: "price_issue", label: "价格不合适" },
  { value: "other", label: "其他原因" }
];

// 订单数据
const orders = ref([
  {
    id: 1,
    orderNumber: "ORD20241201001",
    createTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5分钟前创建，剩余10分钟
    status: "pending",
    totalAmount: 299,
    items: [
      {
        id: 1,
        productName: "YSP35.5型智会瓶",
        specName: "35L",
        price: 299,
        quantity: 1,
        image: new URL("/src/assets/goods/goods1.png", import.meta.url).href
      }
    ]
  },
  {
    id: 2,
    orderNumber: "ORD20241201002",
    createTime: "2024-12-01 14:20:00",
    status: "paid",
    totalAmount: 123,
    items: [
      {
        id: 2,
        productName: "液化气软管",
        specName: "2米",
        price: 78,
        quantity: 1,
        image: new URL("/src/assets/goods/goods3.png", import.meta.url).href
      },
      {
        id: 3,
        productName: "减压阀",
        price: 45,
        quantity: 1,
        image: new URL("/src/assets/goods/goods2.png", import.meta.url).href
      }
    ]
  },
  {
    id: 3,
    orderNumber: "ORD20241130001",
    createTime: "2024-11-30 16:45:00",
    status: "completed",
    totalAmount: 199,
    items: [
      {
        id: 4,
        productName: "YSP15型小瓶",
        specName: "15L",
        price: 199,
        quantity: 1,
        image: new URL("/src/assets/goods/goods6.png", import.meta.url).href
      }
    ]
  }
]);

// 根据状态筛选订单
const filteredOrders = computed(() => {
  if (activeStatus.value === "all") {
    return orders.value;
  }
  return orders.value.filter(order => order.status === activeStatus.value);
});

// 获取状态样式类
const getStatusClass = status => {
  const statusMap = {
    pending: "status-pending",
    paid: "status-paid",
    shipped: "status-shipped",
    completed: "status-completed",
    cancelled: "status-cancelled"
  };
  return statusMap[status] || "";
};

// 获取状态文本
const getStatusText = status => {
  const statusMap = {
    pending: "待付款",
    paid: "待发货",
    shipped: "待收货",
    completed: "已完成",
    cancelled: "已取消"
  };
  return statusMap[status] || status;
};

// 获取取消原因文本
const getCancelReasonText = reasonValue => {
  const reason = cancelReasons.find(r => r.value === reasonValue);
  return reason ? reason.label : reasonValue;
};

// 格式化时间
const formatTime = timeStr => {
  const date = new Date(timeStr);
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
};

// 获取商品总数量
const getTotalQuantity = items => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

// 计算剩余时间（毫秒）
const getRemainingTime = createTime => {
  const createDate = new Date(createTime);
  const now = new Date();
  const timeLimit = 15 * 60 * 1000; // 15分钟
  const elapsed = now.getTime() - createDate.getTime();
  const remaining = timeLimit - elapsed;
  return Math.max(0, remaining);
};

// 格式化倒计时显示
const formatCountdown = milliseconds => {
  if (milliseconds <= 0) return "已超时";

  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

// 开始倒计时
const startCountdown = (orderId, createTime) => {
  // 清除之前的定时器
  if (countdownTimers.value.has(orderId)) {
    clearInterval(countdownTimers.value.get(orderId));
  }

  const updateCountdown = () => {
    const remaining = getRemainingTime(createTime);

    if (remaining <= 0) {
      // 时间到，自动取消订单
      autoCancelOrder(orderId);
      return;
    }

    countdowns.value.set(orderId, remaining);
  };

  // 立即更新一次
  updateCountdown();

  // 每秒更新一次
  const timer = setInterval(updateCountdown, 1000);
  countdownTimers.value.set(orderId, timer);
};

// 停止倒计时
const stopCountdown = orderId => {
  if (countdownTimers.value.has(orderId)) {
    clearInterval(countdownTimers.value.get(orderId));
    countdownTimers.value.delete(orderId);
  }
  countdowns.value.delete(orderId);
};

// 自动取消订单
const autoCancelOrder = orderId => {
  const order = orders.value.find(o => o.id === orderId);
  if (order && order.status === "pending") {
    order.status = "cancelled";
    showFailToast(`订单 ${order.orderNumber} 已超时自动取消`);

    // 停止倒计时
    stopCountdown(orderId);
  }
};

// 状态切换
const onStatusChange = name => {
  activeStatus.value = name;
  // 重置加载状态
  loading.value = false;
  finished.value = false;
};

// 下拉刷新
const onRefresh = () => {
  setTimeout(() => {
    refreshing.value = false;
    showSuccessToast("刷新成功");
  }, 1000);
};

// 加载更多
const onLoad = () => {
  setTimeout(() => {
    loading.value = false;
    finished.value = true;
  }, 1000);
};

// 支付订单
const payOrder = async order => {
  try {
    await showConfirmDialog({
      title: "确认付款",
      message: `确认支付订单 ${order.orderNumber}，金额 ¥${order.totalAmount.toFixed(2)}？`
    });

    // 模拟支付成功
    order.status = "paid";
    showSuccessToast("支付成功");

    // 支付成功后停止倒计时
    stopCountdown(order.id);
  } catch {
    // 用户取消
  }
};

// 取消订单
const cancelOrder = order => {
  currentOrderToCancel.value = order;
  selectedCancelReason.value = "";
  showCancelPopup.value = true;
};

// 确认取消订单
const confirmCancelOrder = () => {
  if (!selectedCancelReason.value) {
    showFailToast("请选择取消原因");
    return;
  }

  const order = currentOrderToCancel.value;
  if (order) {
    // 取消订单
    order.status = "cancelled";
    order.cancelReason = selectedCancelReason.value;
    order.cancelTime = new Date().toISOString();

    showSuccessToast("订单已取消");

    // 取消订单后停止倒计时
    stopCountdown(order.id);

    // 关闭弹框
    showCancelPopup.value = false;
    currentOrderToCancel.value = null;
    selectedCancelReason.value = "";
  }
};

// 确认收货
const confirmReceive = async order => {
  try {
    await showConfirmDialog({
      title: "确认收货",
      message: "确认已收到商品？"
    });

    order.status = "completed";
    showSuccessToast("确认收货成功");
  } catch {
    // 用户取消
  }
};

// 再次购买
const buyAgain = order => {
  // 将商品重新加入购物车
  order.items.forEach(item => {
    const cartItem = {
      id: `${item.id}-${Date.now()}`,
      productId: item.id,
      productName: item.productName,
      specId: item.specId,
      specName: item.specName,
      price: item.price,
      originalPrice: item.price,
      image: item.image,
      category: "gas",
      quantity: 1
    };

    // 获取现有购物车数据
    const existingCart = localStorage.getItem("cartItems");
    let cartItems = existingCart ? JSON.parse(existingCart) : [];

    // 检查是否已存在
    const existingItem = cartItems.find(
      cartItem =>
        cartItem.productId === item.id && cartItem.specId === item.specId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.push(cartItem);
    }

    // 保存到本地存储
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  });

  showSuccessToast("已添加到购物车");
  router.push("/cart");
};

// 查看订单详情
const viewOrderDetail = order => {
  router.push({
    name: "OrderDetail",
    params: { id: order.id }
  });
};

// 重新下单
const reorder = order => {
  // 将商品重新加入购物车
  order.items.forEach(item => {
    const cartItem = {
      id: `${item.id}-${Date.now()}`,
      productId: item.id,
      productName: item.productName,
      specId: item.specId,
      specName: item.specName,
      price: item.price,
      originalPrice: item.price,
      image: item.image,
      category: "gas",
      quantity: 1
    };

    // 获取现有购物车数据
    const existingCart = localStorage.getItem("cartItems");
    let cartItems = existingCart ? JSON.parse(existingCart) : [];

    // 检查是否已存在
    const existingItem = cartItems.find(
      cartItem =>
        cartItem.productId === item.id && cartItem.specId === item.specId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.push(cartItem);
    }

    // 保存到本地存储
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  });

  showSuccessToast("已添加到购物车");
  router.push("/cart");
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 初始化倒计时
const initCountdowns = () => {
  orders.value.forEach(order => {
    if (order.status === "pending") {
      startCountdown(order.id, order.createTime);
    }
  });
};

// 清理所有倒计时
const cleanupCountdowns = () => {
  countdownTimers.value.forEach(timer => {
    clearInterval(timer);
  });
  countdownTimers.value.clear();
  countdowns.value.clear();
};

// 生命周期钩子
onMounted(() => {
  initCountdowns();
});

onUnmounted(() => {
  cleanupCountdowns();
});
</script>

<style lang="less" scoped>
.orders-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
  margin: 0;
  padding-top: 0;
}

.fixed-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.order-tabs {
  background: white;
  margin: 0;
  padding: 0;
}

.orders-list {
  padding: 0 10px;
}

.empty-orders {
  padding: 60px 20px;
  text-align: center;
}

.order-item {
  background: white;
  border-radius: 12px;
  margin-bottom: 15px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-number {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.order-time {
  font-size: 12px;
  color: #999;
}

.countdown-timer {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;

  .van-icon {
    font-size: 14px;
    color: #ff4757;
  }

  .countdown-text {
    font-size: 12px;
    color: #ff4757;
    font-weight: 500;
  }
}

.order-status {
  font-size: 14px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 12px;

  &.status-pending {
    color: #ff9800;
    background: #fff3e0;
  }

  &.status-paid {
    color: #2196f3;
    background: #e3f2fd;
  }

  &.status-shipped {
    color: #9c27b0;
    background: #f3e5f5;
  }

  &.status-completed {
    color: #4caf50;
    background: #e8f5e8;
  }

  &.status-cancelled {
    color: #999;
    background: #f5f5f5;
  }
}

.order-products {
  padding: 15px;
}

.product-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.3;
}

.product-spec {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .price {
    font-size: 14px;
    font-weight: 600;
    color: #ff4757;
  }

  .quantity {
    font-size: 12px;
    color: #999;
  }
}

.order-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;

  .total-price {
    font-size: 16px;
    font-weight: 600;
    color: #ff4757;
  }
}

.order-actions {
  display: flex;
  gap: 10px;
  padding: 15px;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;

  .van-button {
    min-width: 80px;
  }
}

.cancel-reason {
  padding: 12px 15px;
  background: #f8f8f8;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .cancel-label {
    font-size: 12px;
    color: #666;
    font-weight: 500;
  }

  .cancel-text {
    font-size: 12px;
    color: #333;
    font-weight: 500;
  }

  .cancel-time {
    font-size: 11px;
    color: #999;
    margin-left: auto;
  }
}

:deep(.van-tabs__wrap) {
  background: white;
}

:deep(.van-tab) {
  color: #666;
  font-weight: 500;
}

:deep(.van-tab--active) {
  color: #1989fa;
  font-weight: 600;
}

:deep(.van-tabs__line) {
  background-color: #1989fa;
}

:deep(.van-nav-bar) {
  background: #1989fa;
  margin: 0;
  padding: 0;

  .van-nav-bar__title {
    color: white;
  }

  .van-icon {
    color: white;
  }
}

// 取消订单弹框样式
.cancel-order-popup {
  width: 320px;
  padding: 0;
  border-radius: 16px;
  overflow: hidden;

  .popup-header {
    background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
    color: white;
    padding: 24px 20px 20px;
    text-align: center;

    .popup-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .popup-subtitle {
      font-size: 14px;
      opacity: 0.9;
    }
  }

  .cancel-reasons {
    padding: 20px 0;
    max-height: 300px;
    overflow-y: auto;

    .van-cell {
      padding: 16px 20px;

      &:not(:last-child)::after {
        left: 20px;
        right: 20px;
      }
    }
  }

  .popup-actions {
    display: flex;
    gap: 12px;
    padding: 20px;
    border-top: 1px solid #f0f0f0;

    .action-btn {
      flex: 1;
      border-radius: 25px;
      font-weight: 500;
      height: 44px;
    }
  }
}
</style>

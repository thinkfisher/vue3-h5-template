<template>
  <div class="order-detail-page">
    <!-- 页面标题 -->
    <van-nav-bar
      title="订单详情"
      left-arrow
      @click-left="goBack"
      class="fixed-nav"
    />

    <!-- 订单状态 -->
    <div class="order-status">
      <div class="status-icon">
        <van-icon :name="getStatusIcon()" />
      </div>
      <div class="status-info">
        <div class="status-text">{{ getStatusText() }}</div>
        <div v-if="order.status === 'pending'" class="countdown">
          剩余支付时间：{{ countdownText }}
        </div>
      </div>
    </div>

    <!-- 订单信息 -->
    <div class="order-info">
      <div class="section-title">订单信息</div>
      <div class="info-content">
        <div class="info-item">
          <span class="label">订单号：</span>
          <span class="value">{{ order.orderNumber || '暂无' }}</span>
        </div>
        <div class="info-item">
          <span class="label">下单时间：</span>
          <span class="value">{{ formatTime(order.createTime) || '暂无' }}</span>
        </div>
        <div class="info-item">
          <span class="label">订单状态：</span>
          <span class="value">{{ getStatusText() }}</span>
        </div>
        <div v-if="order.cancelReason" class="info-item">
          <span class="label">取消原因：</span>
          <span class="value">{{ getCancelReasonText(order.cancelReason) }}</span>
        </div>
        <div v-if="order.cancelTime" class="info-item">
          <span class="label">取消时间：</span>
          <span class="value">{{ formatTime(order.cancelTime) }}</span>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="order-items">
      <div class="section-title">商品信息</div>
      <div class="items-content">
        <div
          v-for="item in order.items"
          :key="item.id"
          class="order-item"
        >
          <div class="item-image">
            <img :src="item.image" :alt="item.productName" />
          </div>
          <div class="item-info">
            <div class="item-name">{{ item.productName || '商品名称' }}</div>
            <div v-if="item.specName" class="item-spec">
              规格：{{ item.specName }}
            </div>
            <div class="item-price">
              <span class="price">¥{{ item.price || 0 }}</span>
              <span class="quantity">x{{ item.quantity || 0 }}</span>
            </div>
          </div>
          <div class="item-total">
            ¥{{ ((item.price || 0) * (item.quantity || 0)).toFixed(2) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 价格信息 -->
    <div class="price-info">
      <div class="section-title">价格信息</div>
      <div class="price-content">
        <div class="price-item">
          <span class="label">商品总额：</span>
          <span class="value">¥{{ (order.totalAmount || 0).toFixed(2) }}</span>
        </div>
        <div class="price-item">
          <span class="label">运费：</span>
          <span class="value">¥0.00</span>
        </div>
        <div class="price-item total">
          <span class="label">实付金额：</span>
          <span class="value">¥{{ (order.totalAmount || 0).toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="order-actions">
      <van-button
        v-if="order.status === 'pending'"
        type="danger"
        size="large"
        @click="cancelOrder"
      >
        取消订单
      </van-button>
      <van-button
        v-if="order.status === 'pending'"
        type="primary"
        size="large"
        @click="payOrder"
      >
        立即支付
      </van-button>
      <van-button
        v-if="order.status === 'shipped'"
        type="primary"
        size="large"
        @click="confirmReceive"
      >
        确认收货
      </van-button>
      <van-button
        v-if="order.status === 'completed'"
        type="default"
        size="large"
        @click="buyAgain"
      >
        再次购买
      </van-button>
    </div>
  </div>
</template>

<script setup name="OrderDetail">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showSuccessToast, showFailToast, showConfirmDialog } from "vant";

const router = useRouter();
const route = useRoute();

// 订单数据
const order = ref({});
const countdownText = ref("");

// 倒计时定时器
let countdownTimer = null;

// 获取状态图标
const getStatusIcon = () => {
  const statusMap = {
    pending: "clock-o",
    paid: "success",
    shipped: "logistics",
    completed: "passed",
    cancelled: "cross"
  };
  return statusMap[order.value?.status] || "clock-o";
};

// 获取状态文本
const getStatusText = () => {
  const statusMap = {
    pending: "待付款",
    paid: "已付款",
    shipped: "已发货",
    completed: "已完成",
    cancelled: "已取消"
  };
  return statusMap[order.value?.status] || "未知状态";
};

// 获取取消原因文本
const getCancelReasonText = (reason) => {
  const reasonMap = {
    change_mind: "不想买了",
    wrong_info: "信息填写错误",
    duplicate_order: "重复下单",
    price_issue: "价格不合适",
    other: "其他原因"
  };
  return reasonMap[reason] || reason;
};

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return date.toLocaleString("zh-CN");
};

// 倒计时
const startCountdown = () => {
  if (order.value?.status !== "pending") return;
  
  const endTime = new Date(order.value?.createTime || Date.now()).getTime() + 15 * 60 * 1000; // 15分钟后
  
  const updateCountdown = () => {
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) {
      countdownText.value = "已超时";
      // 自动取消订单
      autoCancelOrder();
      return;
    }
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    countdownText.value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 1000);
};

// 自动取消订单
const autoCancelOrder = () => {
  if (!order.value) return;
  
  order.value.status = "cancelled";
  order.value.cancelReason = "timeout";
  order.value.cancelTime = new Date().toISOString();
  
  // 更新本地存储
  updateOrderInStorage();
  
  showFailToast("订单已超时，自动取消");
};

// 更新本地存储中的订单
const updateOrderInStorage = () => {
  if (!order.value || !order.value.id) return;
  
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const orderIndex = orders.findIndex(o => o.id === order.value.id);
  
  if (orderIndex !== -1) {
    orders[orderIndex] = order.value;
    localStorage.setItem("orders", JSON.stringify(orders));
  }
};

// 取消订单
const cancelOrder = () => {
  if (!order.value) return;
  
  showConfirmDialog({
    title: "取消订单",
    message: "确定要取消这个订单吗？",
    confirmButtonText: "确定取消",
    cancelButtonText: "再想想"
  }).then(() => {
    order.value.status = "cancelled";
    order.value.cancelReason = "user_cancelled";
    order.value.cancelTime = new Date().toISOString();
    
    updateOrderInStorage();
    showSuccessToast("订单已取消");
  });
};

// 支付订单
const payOrder = () => {
  showSuccessToast("跳转支付页面...");
  // 这里可以跳转到支付页面
};

// 确认收货
const confirmReceive = () => {
  if (!order.value) return;
  
  showConfirmDialog({
    title: "确认收货",
    message: "确认已收到商品吗？",
    confirmButtonText: "确认收货",
    cancelButtonText: "再等等"
  }).then(() => {
    order.value.status = "completed";
    updateOrderInStorage();
    showSuccessToast("确认收货成功");
  });
};

// 再次购买
const buyAgain = () => {
  if (!order.value || !order.value.items) return;
  
  // 将商品重新加入购物车
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
  
  order.value.items.forEach(item => {
    const existingItem = cartItems.find(cartItem => 
      cartItem.productId === item.id && cartItem.specId === item.specId
    );
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cartItems.push({
        id: `${item.id}-${item.specId || 'default'}`,
        productId: item.id,
        productName: item.productName,
        specId: item.specId,
        specName: item.specName,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        selected: true
      });
    }
  });
  
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  
  // 触发存储事件
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "cartItems",
      newValue: JSON.stringify(cartItems)
    })
  );
  
  showSuccessToast("已加入购物车");
  router.push("/cart");
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 初始化
onMounted(() => {
  const orderId = parseInt(route.params.id);
  
  // 从本地存储获取订单数据
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const foundOrder = orders.find(o => o.id === orderId);
  
  if (foundOrder) {
    order.value = foundOrder;
    
    // 如果是待付款状态，开始倒计时
    if (order.value?.status === "pending") {
      startCountdown();
    }
  } else {
    showFailToast("订单不存在");
    router.back();
  }
});

// 清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style lang="less" scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120px;
}

.fixed-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.order-status {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
  margin-top: 46px;

  .status-icon {
    .van-icon {
      font-size: 48px;
    }
  }

  .status-info {
    flex: 1;

    .status-text {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .countdown {
      font-size: 14px;
      opacity: 0.9;
    }
  }
}

.order-info,
.order-items,
.price-info {
  background: white;
  margin-bottom: 10px;
  padding: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.info-content {
  .info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;

    .label {
      color: #666;
      font-size: 14px;
    }

    .value {
      color: #333;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.items-content {
  .order-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 0;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .item-info {
      flex: 1;
      min-width: 0;

      .item-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 5px;
        line-height: 1.4;
      }

      .item-spec {
        font-size: 12px;
        color: #666;
        margin-bottom: 8px;
        background: #f5f5f5;
        padding: 2px 8px;
        border-radius: 4px;
        display: inline-block;
      }

      .item-price {
        display: flex;
        align-items: center;
        gap: 10px;

        .price {
          font-size: 16px;
          font-weight: 600;
          color: #ff4757;
        }

        .quantity {
          font-size: 14px;
          color: #666;
        }
      }
    }

    .item-total {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      flex-shrink: 0;
    }
  }
}

.price-content {
  .price-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;

    .label {
      color: #666;
      font-size: 14px;
    }

    .value {
      color: #333;
      font-size: 14px;
      font-weight: 500;
    }

    &.total {
      border-top: 1px solid #eee;
      padding-top: 12px;
      margin-top: 12px;

      .label,
      .value {
        font-size: 16px;
        font-weight: 600;
        color: #ff4757;
      }
    }
  }
}

.order-actions {
  position: fixed;
  bottom: 80px;
  left: 0;
  right: 0;
  background: white;
  padding: 15px 20px;
  display: flex;
  gap: 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  .van-button {
    flex: 1;
    border-radius: 25px;
    font-weight: 500;
  }
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
</style>

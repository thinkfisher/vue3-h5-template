<template>
  <van-tabbar v-model="active" :placeholder="true" :route="true" fixed>
    <van-tabbar-item
      v-for="(item, index) in tabbarData"
      :key="index"
      :icon="item.icon"
      :to="item.to"
    >
      {{ item.title }}
      <van-badge
        v-if="item.title === '购物车' && cartItemCount > 0"
        :content="cartItemCount > 99 ? '99+' : cartItemCount"
        :show="cartItemCount > 0"
        class="cart-badge"
      />
    </van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";

const active = ref(0);
const cartItemCount = ref(0);
const tabbarData = reactive([
  {
    icon: "wap-home-o",
    title: "首页",
    to: {
      name: "Home"
    }
  },
  {
    icon: "orders-o",
    title: "订单",
    to: {
      name: "Orders"
    }
  },
  {
    icon: "shopping-cart-o",
    title: "购物车",
    to: {
      name: "Cart"
    }
  },
  {
    icon: "user-o",
    title: "我的",
    to: {
      name: "Profile"
    }
  }
]);

// 获取购物车商品数量
const getCartItemCount = () => {
  const cartItems = localStorage.getItem("cartItems");
  if (cartItems) {
    const items = JSON.parse(cartItems);
    return items.reduce((total, item) => total + item.quantity, 0);
  }
  return 0;
};

// 更新购物车数量
const updateCartItemCount = () => {
  const newCount = getCartItemCount();
  cartItemCount.value = newCount;
};

// 处理存储变化
const handleStorageChange = event => {
  if (event.key === "cartItems") {
    updateCartItemCount();
  }
};

// 生命周期钩子
onMounted(() => {
  updateCartItemCount();

  // 监听购物车数据变化
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("focus", updateCartItemCount);

  // 添加页面可见性变化监听
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      updateCartItemCount();
    }
  });
});

onUnmounted(() => {
  window.removeEventListener("storage", handleStorageChange);
  window.removeEventListener("focus", updateCartItemCount);
});
</script>

<style lang="less" scoped>
.cart-badge {
  position: absolute;
  top: 0;
  right: 26px;
  z-index: 1000;
  transform: scale(0.8);
}

:deep(.van-tabbar-item) {
  position: relative;
}
</style>

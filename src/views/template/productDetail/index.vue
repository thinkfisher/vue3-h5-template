<template>
  <div class="product-detail-page">
    <!-- 页面标题 -->
    <van-nav-bar
      title="商品详情"
      left-arrow
      class="fixed-nav"
      @click-left="goBack"
    />

    <!-- 商品图片轮播 -->
    <div class="product-images">
      <van-swipe :autoplay="3000" indicator-color="#1989fa">
        <van-swipe-item v-for="(image, index) in product.images" :key="index">
          <img :src="image" :alt="product.name" />
        </van-swipe-item>
      </van-swipe>
    </div>

    <!-- 商品基本信息 -->
    <div class="product-info">
      <div class="product-name">{{ product.name }}</div>
      <div class="product-desc">{{ product.description }}</div>

      <!-- 规格选择 -->
      <div
        v-if="product.specs && product.specs.length > 0"
        class="product-specs"
      >
        <div class="specs-title">选择规格：</div>
        <div class="specs-options">
          <van-button
            v-for="spec in product.specs"
            :key="spec.id"
            :type="selectedSpec?.id === spec.id ? 'primary' : 'default'"
            size="small"
            class="spec-btn"
            @click="selectSpec(spec)"
          >
            {{ spec.name }}
          </van-button>
        </div>
      </div>

      <!-- 价格信息 -->
      <div class="product-price">
        <span class="current-price">¥{{ getCurrentPrice() }}</span>
        <span class="original-price">¥{{ getOriginalPrice() }}</span>
      </div>

      <!-- 数量选择 -->
      <div class="quantity-selector">
        <span class="quantity-label">数量：</span>
        <van-stepper v-model="quantity" min="1" max="99" />
      </div>
    </div>

    <!-- 商品详情 -->
    <div class="product-details">
      <div class="section-title">商品详情</div>
      <div class="detail-content">
        <div class="detail-item">
          <span class="label">商品名称：</span>
          <span class="value">{{ product.name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">商品分类：</span>
          <span class="value">{{ getCategoryName(product.category) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">商品描述：</span>
          <span class="value">{{ product.description }}</span>
        </div>
        <div
          v-if="product.specs && product.specs.length > 0"
          class="detail-item"
        >
          <span class="label">可选规格：</span>
          <span class="value">{{
            product.specs.map(s => s.name).join("、")
          }}</span>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-actions">
      <div class="action-left">
        <van-button
          type="default"
          size="large"
          class="cart-btn"
          @click="goToCart"
        >
          <div class="cart-btn-content">
            <div class="cart-icon-wrapper">
              <van-icon name="shopping-cart-o" />
              <van-badge
                v-if="cartItemCount > 0"
                :content="cartItemCount > 99 ? '99+' : cartItemCount"
                class="cart-badge"
              />
            </div>
            <div class="cart-text">购物车</div>
          </div>
        </van-button>
      </div>
      <div class="action-center">
        <van-button
          type="primary"
          size="large"
          :disabled="!canAddToCart"
          class="add-cart-btn"
          @click="addToCart"
        >
          加入购物车
        </van-button>
      </div>
      <div class="action-right">
        <van-button
          type="danger"
          size="large"
          :disabled="!canAddToCart"
          class="buy-now-btn"
          @click="buyNow"
        >
          <van-icon name="shopping-o" />
          立即购买
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup name="ProductDetail">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showSuccessToast, showFailToast } from "vant";

const router = useRouter();
const route = useRoute();

// 商品数据
const product = ref({});

// 所有商品数据
const allProducts = ref([
  {
    id: 1,
    name: "YSP35.5型智会瓶",
    description: "智能液化气钢瓶，安全可靠，采用先进技术制造，确保使用安全。",
    category: "gas",
    price: 299,
    originalPrice: 399,
    images: [new URL("/src/assets/goods/goods1.png", import.meta.url).href],
    specs: [
      { id: 1, name: "35L", price: 299, originalPrice: 399 },
      { id: 2, name: "33L", price: 279, originalPrice: 379 }
    ]
  },
  {
    id: 2,
    name: "液化气减压阀",
    description: "高品质减压阀，确保安全使用",
    category: "parts",
    price: 89,
    originalPrice: 129,
    images: [new URL("/src/assets/goods/goods2.png", import.meta.url).href]
  },
  {
    id: 3,
    name: "液化气软管",
    description: "高品质液化气软管，耐压耐腐蚀，安全可靠，使用寿命长。",
    category: "parts",
    price: 45,
    originalPrice: 68,
    images: [new URL("/src/assets/goods/goods3.png", import.meta.url).href],
    specs: [
      { id: 5, name: "1米", price: 45, originalPrice: 68 },
      { id: 6, name: "2米", price: 78, originalPrice: 118 },
      { id: 7, name: "3米", price: 108, originalPrice: 158 }
    ]
  },
  {
    id: 4,
    name: "YSP50型液化气瓶",
    description: "大容量液化气钢瓶",
    category: "gas",
    price: 399,
    originalPrice: 499,
    images: [new URL("/src/assets/goods/goods5.png", import.meta.url).href]
  },
  {
    id: 5,
    name: "液化气报警器",
    description: "智能气体泄漏检测报警器",
    category: "parts",
    price: 158,
    originalPrice: 198,
    images: [new URL("/src/assets/goods/goods4.png", import.meta.url).href]
  },
  {
    id: 6,
    name: "YSP15型小瓶",
    description: "便携式小容量液化气钢瓶，适合户外活动和临时使用。",
    category: "gas",
    price: 199,
    originalPrice: 259,
    images: [new URL("/src/assets/goods/goods6.png", import.meta.url).href],
    specs: [
      { id: 8, name: "15L", price: 199, originalPrice: 259 },
      { id: 9, name: "12L", price: 179, originalPrice: 239 }
    ]
  }
]);

// 选中的规格
const selectedSpec = ref(null);
const quantity = ref(1);

// 购物车商品数量
const cartItemCount = ref(0);

// 计算属性
const canAddToCart = computed(() => {
  if (product.value.specs && product.value.specs.length > 0) {
    return selectedSpec.value !== null;
  }
  return true;
});

// 获取当前价格
const getCurrentPrice = () => {
  if (product.value.specs && product.value.specs.length > 0) {
    return selectedSpec.value
      ? selectedSpec.value.price
      : product.value.specs[0].price;
  }
  return product.value.price || 0;
};

// 获取原价
const getOriginalPrice = () => {
  if (product.value.specs && product.value.specs.length > 0) {
    return selectedSpec.value
      ? selectedSpec.value.originalPrice
      : product.value.specs[0].originalPrice;
  }
  return product.value.originalPrice || 0;
};

// 获取分类名称
const getCategoryName = category => {
  const categoryMap = {
    gas: "液化气",
    parts: "配件"
  };
  return categoryMap[category] || category;
};

// 选择规格
const selectSpec = spec => {
  selectedSpec.value = spec;
};

// 加入购物车
const addToCart = () => {
  if (!canAddToCart.value) {
    showFailToast("请先选择规格");
    return;
  }

  let itemToAdd;
  if (product.value.specs && product.value.specs.length > 0) {
    itemToAdd = {
      id: `${product.value.id}-${selectedSpec.value.id}`,
      productId: product.value.id,
      productName: product.value.name,
      specId: selectedSpec.value.id,
      specName: selectedSpec.value.name,
      price: selectedSpec.value.price,
      originalPrice: selectedSpec.value.originalPrice,
      image: product.value.images[0],
      category: product.value.category,
      quantity: quantity.value
    };
  } else {
    itemToAdd = {
      id: product.value.id.toString(),
      productId: product.value.id,
      productName: product.value.name,
      price: product.value.price,
      originalPrice: product.value.originalPrice,
      image: product.value.images[0],
      category: product.value.category,
      quantity: quantity.value
    };
  }

  // 获取现有购物车数据
  const existingCart = localStorage.getItem("cartItems");
  let cartItems = existingCart ? JSON.parse(existingCart) : [];

  // 检查是否已存在
  const existingItem = cartItems.find(item => item.id === itemToAdd.id);
  if (existingItem) {
    existingItem.quantity += quantity.value;
  } else {
    cartItems.push(itemToAdd);
  }

  // 保存到本地存储
  localStorage.setItem("cartItems", JSON.stringify(cartItems));

  // 手动触发存储事件，通知其他页面更新
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "cartItems",
      newValue: JSON.stringify(cartItems)
    })
  );

  // 更新购物车数量
  updateCartItemCount();

  showSuccessToast("已加入购物车");
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 跳转到购物车
const goToCart = () => {
  router.push("/cart");
};

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
  cartItemCount.value = getCartItemCount();
};

// 立即购买
const buyNow = () => {
  if (!canAddToCart.value) {
    showFailToast("请先选择规格");
    return;
  }

  // 创建订单数据
  let orderData;
  if (product.value.specs && product.value.specs.length > 0) {
    orderData = {
      id: Date.now(),
      orderNumber: `ORD${Date.now()}`,
      createTime: new Date().toISOString(),
      status: "pending",
      totalAmount: selectedSpec.value.price * quantity.value,
      items: [
        {
          id: selectedSpec.value.id,
          productName: product.value.name,
          specName: selectedSpec.value.name,
          price: selectedSpec.value.price,
          quantity: quantity.value,
          image: product.value.images[0]
        }
      ]
    };
  } else {
    orderData = {
      id: Date.now(),
      orderNumber: `ORD${Date.now()}`,
      createTime: new Date().toISOString(),
      status: "pending",
      totalAmount: product.value.price * quantity.value,
      items: [
        {
          id: product.value.id,
          productName: product.value.name,
          price: product.value.price,
          quantity: quantity.value,
          image: product.value.images[0]
        }
      ]
    };
  }

  // 将订单数据存储到本地存储，供订单页面使用
  localStorage.setItem("currentOrder", JSON.stringify(orderData));

  // 跳转到订单确认页面
  router.push("/checkout");
};

// 初始化
onMounted(() => {
  // 根据路由参数加载商品数据
  const productId = parseInt(route.params.id);
  console.log("商品详情页 - 路由参数ID:", productId);
  console.log("商品详情页 - 可用商品:", allProducts.value);

  const foundProduct = allProducts.value.find(p => p.id === productId);
  console.log("商品详情页 - 找到的商品:", foundProduct);

  if (foundProduct) {
    product.value = foundProduct;
    // 如果有规格，默认选择第一个
    if (product.value.specs && product.value.specs.length > 0) {
      selectedSpec.value = product.value.specs[0];
    }
  } else {
    // 如果找不到商品，显示错误信息
    showFailToast("商品不存在");
    router.back();
  }

  // 获取购物车数量
  updateCartItemCount();

  // 监听购物车数据变化
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("focus", updateCartItemCount);
});

// 清理事件监听器
onUnmounted(() => {
  window.removeEventListener("storage", handleStorageChange);
  window.removeEventListener("focus", updateCartItemCount);
});

// 处理存储变化
const handleStorageChange = event => {
  if (event.key === "cartItems") {
    updateCartItemCount();
  }
};
</script>

<style lang="less" scoped>
.product-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.fixed-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.product-images {
  background: white;
  margin-bottom: 10px;

  img {
    width: 100%;
    height: 300px;
    object-fit: cover;
  }
}

.product-info {
  background: white;
  padding: 20px;
  margin-bottom: 10px;
}

.product-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.4;
}

.product-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.product-specs {
  margin-bottom: 20px;

  .specs-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
  }

  .specs-options {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    .spec-btn {
      min-width: 80px;
      border-radius: 20px;
    }
  }
}

.product-price {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;

  .current-price {
    font-size: 24px;
    font-weight: 600;
    color: #ff4757;
  }

  .original-price {
    font-size: 16px;
    color: #999;
    text-decoration: line-through;
  }
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 15px;

  .quantity-label {
    font-size: 16px;
    color: #333;
    font-weight: 500;
  }
}

.product-details {
  background: white;
  padding: 20px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.detail-content {
  .detail-item {
    display: flex;
    margin-bottom: 12px;

    .label {
      font-size: 14px;
      color: #666;
      min-width: 80px;
      flex-shrink: 0;
    }

    .value {
      font-size: 14px;
      color: #333;
      flex: 1;
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 15px 20px;
  display: flex;
  gap: 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.action-left {
  flex: 1;
}

.action-center {
  flex: 1.5;
}

.action-right {
  flex: 1.5;
}

.cart-btn {
  width: 100%;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  position: relative;
  padding: 8px 12px;

  .cart-btn-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .cart-icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .van-icon {
    font-size: 20px;
  }

  .cart-text {
    font-size: 12px;
    line-height: 1;
  }

  .cart-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    transform: scale(0.8);
  }
}

.add-cart-btn {
  width: 100%;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
  transition: all 0.3s ease;

  .van-icon {
    font-size: 16px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 71, 87, 0.6);
  }

  &:active {
    transform: translateY(0);
  }
}

.buy-now-btn {
  width: 100%;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;

  .van-icon {
    font-size: 16px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
  }

  &:active {
    transform: translateY(0);
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

<template>
  <div class="products-page">
    <!-- 分类选择器 -->
    <div class="category-tabs">
      <van-tabs
        v-model:active="activeCategory"
        sticky
        @change="onCategoryChange"
      >
        <van-tab title="全部" name="all" />
        <van-tab title="液化气" name="gas" />
        <van-tab title="配件" name="parts" />
      </van-tabs>
    </div>

    <!-- 商品列表 -->
    <div class="products-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div class="products-grid">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-item"
            >
              <div class="product-image" @click="viewDetail(product)">
                <img :src="product.image" :alt="product.name" />
              </div>
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-desc">{{ product.description }}</div>

                <!-- 规格选择 -->
                <div
                  v-if="product.specs && product.specs.length > 0"
                  class="product-specs"
                >
                  <span class="specs-label">规格：</span>
                  <div class="specs-options">
                    <van-button
                      v-for="spec in product.specs"
                      :key="spec.id"
                      :type="
                        selectedSpecs[product.id] === spec.id
                          ? 'primary'
                          : 'default'
                      "
                      size="mini"
                      @click="selectSpec(product.id, spec.id)"
                    >
                      {{ spec.name }}
                    </van-button>
                  </div>
                </div>

                <div class="product-price">
                  <span class="original-price"
                    >¥{{ getCurrentPrice(product).original }}</span
                  >
                  <span class="current-price"
                    >¥{{ getCurrentPrice(product).current }}</span
                  >
                </div>

                <div class="product-actions">
                  <van-button
                    type="primary"
                    size="small"
                    :disabled="
                      product.specs &&
                      product.specs.length > 0 &&
                      !selectedSpecs[product.id]
                    "
                    @click="addToCart(product)"
                  >
                    <van-icon name="shopping-cart-o" />
                  </van-button>
                  <van-button
                    type="default"
                    size="small"
                    @click="viewDetail(product)"
                  >
                    详情
                  </van-button>
                </div>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 购物车悬浮按钮 -->
    <div class="cart-fab" @click="goToCart">
      <van-icon class="cart-icon" name="shopping-cart-o" />
      <van-badge
        class="cart-badge"
        :content="cartItemCount > 99 ? '99+' : cartItemCount"
        :show="cartItemCount > 0"
      />
    </div>
  </div>
</template>

<script setup name="Products">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { showSuccessToast, showFailToast } from "vant";

const router = useRouter();
const activeCategory = ref("all");
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

// 购物车数据
const cartItems = ref([]);
const selectedSpecs = reactive({});

// 商品数据
const products = ref([
  {
    id: 1,
    name: "YSP35.5型智会瓶",
    description: "智能液化气钢瓶，安全可靠",
    category: "gas",
    image: new URL("/src/assets/goods/goods1.png", import.meta.url).href,
    specs: [
      { id: 1, name: "35L", price: 299, originalPrice: 399 },
      { id: 2, name: "33L", price: 279, originalPrice: 379 }
    ],
    hasSpecs: true
  },
  {
    id: 2,
    name: "液化气减压阀",
    description: "高品质减压阀，确保安全使用",
    category: "parts",
    image: new URL("/src/assets/goods/goods2.png", import.meta.url).href,
    price: 89,
    originalPrice: 129,
    hasSpecs: false
  },
  {
    id: 3,
    name: "液化气软管",
    description: "耐压软管，连接安全",
    category: "parts",
    image: new URL("/src/assets/goods/goods3.png", import.meta.url).href,
    specs: [
      { id: 5, name: "1米", price: 45, originalPrice: 68 },
      { id: 6, name: "2米", price: 78, originalPrice: 118 },
      { id: 7, name: "3米", price: 108, originalPrice: 158 }
    ],
    hasSpecs: true
  },
  {
    id: 4,
    name: "YSP50型液化气瓶",
    description: "大容量液化气钢瓶",
    category: "gas",
    image: new URL("/src/assets/goods/goods5.png", import.meta.url).href,
    price: 399,
    originalPrice: 499,
    hasSpecs: false
  },
  {
    id: 5,
    name: "液化气报警器",
    description: "智能气体泄漏检测报警器",
    category: "parts",
    image: new URL("/src/assets/goods/goods4.png", import.meta.url).href,
    price: 158,
    originalPrice: 198,
    hasSpecs: false
  },
  {
    id: 6,
    name: "YSP15型小瓶",
    description: "便携式小容量液化气瓶",
    category: "gas",
    image: new URL("/src/assets/goods/goods6.png", import.meta.url).href,
    specs: [
      { id: 8, name: "15L", price: 199, originalPrice: 259 },
      { id: 9, name: "12L", price: 179, originalPrice: 239 }
    ],
    hasSpecs: true
  }
]);

// 根据分类筛选商品
const filteredProducts = computed(() => {
  if (activeCategory.value === "all") {
    return products.value;
  }
  return products.value.filter(
    product => product.category === activeCategory.value
  );
});

// 购物车商品数量
const cartItemCount = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0);
});

// 获取当前价格（有规格的按规格，没有规格的按商品本身）
const getCurrentPrice = product => {
  if (product.specs && product.specs.length > 0) {
    const selectedSpecId = selectedSpecs[product.id];
    if (selectedSpecId) {
      const spec = product.specs.find(s => s.id === selectedSpecId);
      return {
        original: spec.originalPrice,
        current: spec.price
      };
    }
    return {
      original: product.specs[0].originalPrice,
      current: product.specs[0].price
    };
  }
  return {
    original: product.originalPrice,
    current: product.price
  };
};

// 选择规格
const selectSpec = (productId, specId) => {
  selectedSpecs[productId] = specId;
};

// 加入购物车
const addToCart = product => {
  let itemToAdd;

  if (product.specs && product.specs.length > 0) {
    const selectedSpecId = selectedSpecs[product.id];
    if (!selectedSpecId) {
      showFailToast("请先选择规格");
      return;
    }

    const spec = product.specs.find(s => s.id === selectedSpecId);
    itemToAdd = {
      id: `${product.id}-${spec.id}`,
      productId: product.id,
      productName: product.name,
      specId: spec.id,
      specName: spec.name,
      price: spec.price,
      originalPrice: spec.originalPrice,
      image: product.image,
      category: product.category
    };
  } else {
    itemToAdd = {
      id: product.id.toString(),
      productId: product.id,
      productName: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category
    };
  }

  // 检查购物车中是否已存在
  const existingItem = cartItems.value.find(item => item.id === itemToAdd.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    itemToAdd.quantity = 1;
    cartItems.value.push(itemToAdd);
  }

  // 保存到本地存储
  localStorage.setItem("cartItems", JSON.stringify(cartItems.value));

  // 手动触发存储事件，通知其他页面更新
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "cartItems",
      newValue: JSON.stringify(cartItems.value)
    })
  );

  showSuccessToast("已加入购物车");
};

// 查看商品详情
const viewDetail = product => {
  console.log("商品列表页 - 跳转商品:", product);
  // 跳转到商品详情页
  router.push({
    name: "ProductDetail",
    params: { id: product.id }
  });
};

// 分类切换
const onCategoryChange = name => {
  activeCategory.value = name;
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

// 跳转到购物车
const goToCart = () => {
  router.push("/cart");
};

// 初始化时从本地存储加载购物车数据
onMounted(() => {
  loadCartItems();

  // 监听购物车数据变化
  window.addEventListener("storage", handleStorageChange);

  // 监听页面显示事件，确保从其他页面返回时更新数据
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

// 加载购物车数据
const loadCartItems = () => {
  const savedCart = localStorage.getItem("cartItems");
  if (savedCart) {
    cartItems.value = JSON.parse(savedCart);
  } else {
    cartItems.value = [];
  }
};

// 处理存储变化
const handleStorageChange = e => {
  if (e.key === "cartItems") {
    loadCartItems();
  }
};

// 监听页面显示事件，确保从其他页面返回时更新数据
const handleVisibilityChange = () => {
  if (!document.hidden) {
    loadCartItems();
  }
};

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener("storage", handleStorageChange);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<style lang="less" scoped>
.products-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.category-tabs {
  background: white;
  margin-bottom: 10px;
}

.products-list {
  padding: 0 10px;
}

.products-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 6px;
}

.product-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 160px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  line-height: 1.3;
}

.product-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.3;
}

.product-specs {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;

  .specs-label {
    font-size: 12px;
    color: #666;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .specs-options {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
}

.product-price {
  margin-bottom: 10px;

  .original-price {
    font-size: 12px;
    color: #999;
    text-decoration: line-through;
    margin-right: 8px;
  }

  .current-price {
    font-size: 16px;
    font-weight: 600;
    color: #ff4757;
  }
}

.product-actions {
  display: flex;
  gap: 6px;

  .van-button {
    min-width: auto;
    flex-shrink: 0;
  }
}

.cart-fab {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 56px;
  height: 56px;
  background: #1989fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.4);
  z-index: 1000;
  cursor: pointer;

  &:active {
    transform: scale(0.95);
  }

  .cart-icon {
    position: relative;
  }
  .cart-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    transform: scale(0.8);
  }
}

:deep(.van-badge) {
  position: absolute;
  top: -8px;
  right: -8px;
  transform: scale(0.8);
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

// 响应式设计
@media (max-width: 375px) {
  .products-grid {
    grid-template-columns: 1fr 1fr; // 保持两列布局
    gap: 8px; // 减小间距以适应小屏幕
    padding: 0 4px;
  }

  .product-image {
    height: 140px; // 减小图片高度以适应小屏幕
  }

  .product-info {
    padding: 10px; // 减小内边距
  }

  .product-name {
    font-size: 13px; // 减小字体大小
    margin-bottom: 6px;
  }

  .product-desc {
    font-size: 11px; // 减小字体大小
    margin-bottom: 8px;
  }

  .product-price {
    margin-bottom: 10px;

    .current-price {
      font-size: 15px; // 减小字体大小
    }
  }

  .product-actions {
    gap: 6px;
  }
}

// 确保两列布局在所有情况下都生效
@media (min-width: 376px) {
  .products-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 0 6px;
  }
}
</style>

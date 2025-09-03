<template>
  <div class="cart-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <van-nav-bar
        title="购物车"
        left-arrow
        class="fixed-nav"
        @click-left="goBack"
      >
        <template #right>
          <van-button
            size="small"
            :type="isEditMode ? 'primary' : 'default'"
            @click="toggleEditMode"
          >
            {{ isEditMode ? "完成" : "管理" }}
          </van-button>
        </template>
      </van-nav-bar>
    </div>

    <!-- 购物车内容 -->
    <div v-if="cartItems.length > 0" class="cart-content">
      <!-- 删除提示 -->
      <div class="delete-tip">
        <van-icon name="info-o" />
        <span>左滑商品可删除</span>
      </div>

      <!-- 商品列表 -->
      <div class="cart-items">
        <van-swipe-cell
          v-for="item in cartItems"
          :key="item.id"
          right-width="100"
        >
          <div class="cart-item">
            <!-- 选择框 -->
            <div class="item-checkbox">
              <van-checkbox
                v-model="item.selected"
                @change="e => updateSelection(e, item.id)"
              />
            </div>

            <!-- 商品图片 -->
            <div class="item-image">
              <img :src="item.image" :alt="item.productName" />
            </div>

            <!-- 商品信息区域 -->
            <div class="item-content">
              <!-- 商品名称 -->
              <div class="item-name">{{ item.productName }}</div>

              <!-- 规格、数量、价格区域 -->
              <div class="item-details">
                <div class="item-left">
                  <!-- 规格信息 -->
                  <div v-if="item.specName" class="item-spec">
                    规格：{{ item.specName }}
                    <van-button
                      size="mini"
                      type="primary"
                      plain
                      style="margin-left: 8px; flex-shrink: 0"
                      @click="changeSpec(item)"
                    >
                      换规格
                    </van-button>
                  </div>

                  <!-- 数量 -->
                  <div v-if="!isEditMode" class="item-quantity">
                    <van-stepper
                      v-model="item.quantity"
                      min="1"
                      max="99"
                      @change="updateQuantity(item)"
                    />
                  </div>

                  <!-- 到手价 -->
                  <div class="item-price">
                    <span class="current-price">¥{{ item.price }}</span>
                    <span class="original-price"
                      >¥{{ item.originalPrice }}</span
                    >
                  </div>
                </div>

                <!-- 该项总价 -->
                <div v-if="!isEditMode" class="item-total">
                  ¥{{ (item.price * item.quantity).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 滑动删除 -->
          <template #right>
            <div class="delete-btn" @click="removeItem(item)">
              <van-icon name="delete-o" />
              <span>删除</span>
            </div>
          </template>
        </van-swipe-cell>
      </div>

      <!-- 优惠券 -->
      <div class="coupon-section">
        <van-cell title="优惠券" is-link @click="showCoupons">
          <template #value>
            <span class="coupon-text">{{
              selectedCoupon ? selectedCoupon.name : "未使用"
            }}</span>
          </template>
        </van-cell>
      </div>

      <!-- 配送信息 -->
      <div class="delivery-section">
        <van-cell title="配送方式" is-link @click="showDelivery">
          <template #value>
            <span class="delivery-text">{{ deliveryMethod }}</span>
          </template>
        </van-cell>
      </div>

      <!-- 备注 -->
      <div class="remark-section">
        <van-field
          v-model="remark"
          label="备注"
          type="textarea"
          placeholder="请输入备注信息"
          rows="2"
          maxlength="100"
          show-word-limit
        />
      </div>
    </div>

    <!-- 空购物车 -->
    <div v-else class="empty-cart">
      <van-empty :image="noGoodsImage" description="购物车是空的">
        <van-button type="primary" @click="goToProducts">去购物</van-button>
      </van-empty>
    </div>

    <!-- 底部结算栏 -->
    <div v-if="cartItems.length > 0" class="cart-footer">
      <!-- 正常模式：结算栏 -->
      <div v-if="!isEditMode" class="footer-content">
        <div class="footer-left">
          <van-checkbox v-model="selectAll" @change="onSelectAllChange">
            全选
          </van-checkbox>
          <span class="selected-count">已选({{ selectedItems.length }})</span>
        </div>
        <div class="footer-center">
          <div class="total-info">
            <span>合计：</span>
            <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div v-if="totalSavings > 0" class="savings-info">
            <span>优惠：</span>
            <span class="savings-amount">¥{{ totalSavings.toFixed(2) }}</span>
          </div>
        </div>
        <div class="footer-right">
          <van-button
            type="primary"
            size="large"
            :disabled="selectedItems.length === 0"
            class="checkout-btn"
            @click="checkout"
          >
            结算
          </van-button>
        </div>
      </div>

      <!-- 管理模式：管理工具栏 -->
      <div v-else class="footer-content">
        <div class="footer-left">
          <van-checkbox v-model="selectAll" @change="onSelectAllChange">
            全选
          </van-checkbox>
        </div>
        <div class="footer-center">
          <van-button
            size="normal"
            type="danger"
            plain
            class="clear-btn"
            @click="clearAllItems"
          >
            <van-icon name="delete-o" />
            清空
          </van-button>
        </div>
        <div class="footer-right">
          <van-button
            type="danger"
            size="large"
            :disabled="selectedItems.length === 0"
            class="delete-selected-btn"
            @click="deleteSelectedItems"
          >
            <van-icon name="cross" />
            删除
          </van-button>
        </div>
      </div>
    </div>

    <!-- 优惠券弹窗 -->
    <van-popup v-model:show="showCouponPopup" position="bottom" round>
      <div class="coupon-popup">
        <div class="popup-header">
          <span>选择优惠券</span>
          <van-icon name="cross" @click="showCouponPopup = false" />
        </div>
        <div class="coupon-list">
          <div
            v-for="coupon in availableCoupons"
            :key="coupon.id"
            class="coupon-item"
            :class="{ active: selectedCoupon?.id === coupon.id }"
            @click="selectCoupon(coupon)"
          >
            <div class="coupon-amount">¥{{ coupon.amount }}</div>
            <div class="coupon-condition">满{{ coupon.condition }}可用</div>
            <div class="coupon-name">{{ coupon.name }}</div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 配送方式弹窗 -->
    <van-popup v-model:show="showDeliveryPopup" position="bottom" round>
      <div class="delivery-popup">
        <div class="popup-header">
          <span>选择配送方式</span>
          <van-icon name="cross" @click="showDeliveryPopup = false" />
        </div>
        <div class="delivery-options">
          <van-radio-group v-model="deliveryMethod">
            <van-cell-group>
              <van-cell
                title="快递配送"
                clickable
                @click="deliveryMethod = '快递配送'"
              >
                <template #right-icon>
                  <van-radio name="快递配送" />
                </template>
              </van-cell>
              <van-cell
                title="到店自提"
                clickable
                @click="deliveryMethod = '到店自提'"
              >
                <template #right-icon>
                  <van-radio name="到店自提" />
                </template>
              </van-cell>
            </van-cell-group>
          </van-radio-group>
        </div>
      </div>
    </van-popup>

    <!-- 规格选择弹窗 -->
    <van-popup v-model:show="showSpecPopup" position="bottom" round>
      <div class="spec-popup">
        <div class="popup-header">
          <span>选择规格</span>
          <van-icon name="cross" @click="showSpecPopup = false" />
        </div>
        <div class="spec-content">
          <div class="product-info">
            <img
              :src="currentProduct?.image"
              :alt="currentProduct?.name"
              class="product-image"
            />
            <div class="product-details">
              <div class="product-name">{{ currentProduct?.name }}</div>
              <div class="product-price">
                <span class="original-price"
                  >¥{{ getSelectedSpecPrice()?.originalPrice || "--" }}</span
                >
                <span class="current-price"
                  >¥{{ getSelectedSpecPrice()?.price || "--" }}</span
                >
              </div>
            </div>
          </div>
          <div class="spec-options">
            <div class="spec-title">选择规格：</div>
            <div class="spec-buttons">
              <van-button
                v-for="spec in currentProduct?.specs"
                :key="spec.id"
                :type="selectedSpecId === spec.id ? 'primary' : 'default'"
                size="large"
                style="margin: 5px"
                @click="selectSpec(spec)"
              >
                {{ spec.name }}
              </van-button>
            </div>
          </div>
          <div class="spec-actions">
            <van-button
              type="primary"
              size="large"
              block
              :disabled="!selectedSpecId"
              @click="confirmSpecChange"
            >
              确认更换
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 清空购物车确认弹框 -->
    <van-popup v-model:show="showClearConfirm" position="center" round>
      <div class="custom-confirm">
        <div class="confirm-icon">
          <van-icon name="warning-o" />
        </div>
        <div class="confirm-title">确认清空</div>
        <div class="confirm-message">
          确定要清空购物车中的所有商品吗？此操作不可恢复！
        </div>
        <div class="confirm-actions">
          <van-button size="large" @click="showClearConfirm = false"
            >取消</van-button
          >
          <van-button size="large" type="danger" @click="confirmClearAll"
            >确认清空</van-button
          >
        </div>
      </div>
    </van-popup>

    <!-- 删除选中商品确认弹框 -->
    <van-popup v-model:show="showDeleteConfirm" position="center" round>
      <div class="custom-confirm">
        <div class="confirm-icon">
          <van-icon name="warning-o" />
        </div>
        <div class="confirm-title">确认删除</div>
        <div class="confirm-message">
          {{
            itemToDelete
              ? `确定要删除 ${itemToDelete.productName} 吗？`
              : `确定要删除选中的 ${selectedItems.length} 件商品吗？`
          }}
        </div>
        <div class="confirm-actions">
          <van-button size="large" @click="showDeleteConfirm = false"
            >取消</van-button
          >
          <van-button
            size="large"
            type="danger"
            @click="
              itemToDelete ? confirmDeleteSingle() : confirmDeleteSelected()
            "
          >
            确认删除
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup name="Cart">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showSuccessToast, showFailToast, showConfirmDialog } from "vant";

const router = useRouter();

// 图片资源
const noGoodsImage = new URL("/src/assets/goods/no-goods.png", import.meta.url)
  .href;
const goods1Image = new URL("/src/assets/goods/goods1.png", import.meta.url)
  .href;
const goods3Image = new URL("/src/assets/goods/goods3.png", import.meta.url)
  .href;
const goods6Image = new URL("/src/assets/goods/goods6.png", import.meta.url)
  .href;

// 购物车数据
const cartItems = ref([]);
const remark = ref("");
const deliveryMethod = ref("快递配送");

// 管理模式
const isEditMode = ref(false);

// 弹框状态
const showClearConfirm = ref(false);
const showDeleteConfirm = ref(false);
const itemToDelete = ref(null);

// 优惠券相关
const showCouponPopup = ref(false);
const showDeliveryPopup = ref(false);
const selectedCoupon = ref(null);

// 规格选择相关
const showSpecPopup = ref(false);
const currentProduct = ref(null);
const selectedSpecId = ref(null);
const currentCartItem = ref(null);

// 可用优惠券
const availableCoupons = ref([
  { id: 1, name: "新用户专享", amount: 10, condition: 100 },
  { id: 2, name: "满减优惠", amount: 20, condition: 200 },
  { id: 3, name: "会员专享", amount: 15, condition: 150 }
]);

// 商品数据（用于规格选择）
const products = ref([
  {
    id: 1,
    name: "YSP35.5型智会瓶",
    category: "gas",
    image: goods1Image,
    specs: [
      { id: 1, name: "35L", price: 299, originalPrice: 399 },
      { id: 2, name: "33L", price: 279, originalPrice: 379 }
    ]
  },
  {
    id: 3,
    name: "液化气软管",
    category: "parts",
    image: goods3Image,
    specs: [
      { id: 5, name: "1米", price: 45, originalPrice: 68 },
      { id: 6, name: "2米", price: 78, originalPrice: 118 },
      { id: 7, name: "3米", price: 108, originalPrice: 158 }
    ]
  },
  {
    id: 6,
    name: "YSP15型小瓶",
    category: "gas",
    image: goods6Image,
    specs: [
      { id: 8, name: "15L", price: 199, originalPrice: 259 },
      { id: 9, name: "12L", price: 179, originalPrice: 239 }
    ]
  }
]);

// 全选状态
const selectAll = ref(true);
// 防止循环触发的标志
const isUpdatingSelection = ref(false);

// 计算属性
const selectedItems = computed(() => {
  return cartItems.value.filter(item => item.selected !== false);
});

const totalPrice = computed(() => {
  const subtotal = selectedItems.value.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // 应用优惠券
  if (selectedCoupon.value && subtotal >= selectedCoupon.value.condition) {
    return subtotal - selectedCoupon.value.amount;
  }

  return subtotal;
});

const totalSavings = computed(() => {
  const originalTotal = selectedItems.value.reduce((total, item) => {
    return total + item.originalPrice * item.quantity;
  }, 0);

  const currentTotal = selectedItems.value.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  return originalTotal - currentTotal;
});

// 方法
const goBack = () => {
  router.back();
};

const goToProducts = () => {
  router.push("/products");
};

const updateQuantity = item => {
  // 保存到本地存储
  localStorage.setItem("cartItems", JSON.stringify(cartItems.value));

  // 触发存储事件，通知其他页面更新购物车数量
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "cartItems",
      newValue: JSON.stringify(cartItems.value)
    })
  );
};

const removeItem = async item => {
  // 使用自定义弹框样式
  showDeleteConfirm.value = true;
  // 临时保存要删除的商品
  itemToDelete.value = item;
};

// 一键清空购物车
const clearAllItems = async () => {
  showClearConfirm.value = true;
};

const confirmClearAll = () => {
  cartItems.value = [];
  localStorage.removeItem("cartItems");
  // 触发存储事件，通知其他页面更新购物车数量
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "cartItems",
      newValue: null
    })
  );
  showClearConfirm.value = false;
  showSuccessToast("购物车已清空");
};

// 删除选中的商品
const deleteSelectedItems = async () => {
  if (selectedItems.value.length === 0) {
    showFailToast("请选择要删除的商品");
    return;
  }

  showDeleteConfirm.value = true;
};

const confirmDeleteSelected = () => {
  // 过滤掉选中的商品
  cartItems.value = cartItems.value.filter(item => !item.selected);
  localStorage.setItem("cartItems", JSON.stringify(cartItems.value));
  // 触发存储事件，通知其他页面更新购物车数量
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "cartItems",
      newValue: JSON.stringify(cartItems.value)
    })
  );
  showDeleteConfirm.value = false;
  showSuccessToast("删除成功");
};

const confirmDeleteSingle = () => {
  if (itemToDelete.value) {
    const index = cartItems.value.findIndex(
      i => i.id === itemToDelete.value.id
    );
    if (index > -1) {
      cartItems.value.splice(index, 1);
      localStorage.setItem("cartItems", JSON.stringify(cartItems.value));
      // 触发存储事件，通知其他页面更新购物车数量
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "cartItems",
          newValue: JSON.stringify(cartItems.value)
        })
      );
      showSuccessToast("删除成功");
    }
    itemToDelete.value = null;
  }
  showDeleteConfirm.value = false;
};

// 切换管理模式
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
  if (isEditMode.value) {
    // 进入管理模式时，确保所有商品都有selected属性
    cartItems.value.forEach(item => {
      if (item.selected === undefined) {
        item.selected = true;
      }
    });
  }
};

// 更新选择状态
const updateSelection = (e, id) => {
  // 设置标志，防止循环触发
  isUpdatingSelection.value = true;

  // 当单个商品选择状态改变时，只需要更新全选状态
  // 不需要手动设置商品选中状态，因为van-checkbox已经通过v-model自动处理了
  const allSelected = cartItems.value.every(item => item.selected);
  selectAll.value = allSelected;

  // 保存到本地存储
  localStorage.setItem("cartItems", JSON.stringify(cartItems.value));

  // 触发存储事件，通知其他页面更新购物车数量
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "cartItems",
      newValue: JSON.stringify(cartItems.value)
    })
  );

  // 重置标志
  setTimeout(() => {
    isUpdatingSelection.value = false;
  }, 0);
};

const onSelectAllChange = checked => {
  // 如果正在更新选择状态，则跳过，防止循环触发
  if (isUpdatingSelection.value) {
    return;
  }

  cartItems.value.forEach(item => {
    item.selected = checked;
  });
  localStorage.setItem("cartItems", JSON.stringify(cartItems.value));

  // 触发存储事件，通知其他页面更新购物车数量
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "cartItems",
      newValue: JSON.stringify(cartItems.value)
    })
  );
};

const showCoupons = () => {
  showCouponPopup.value = true;
};

const selectCoupon = coupon => {
  selectedCoupon.value = coupon;
  showCouponPopup.value = false;
  showSuccessToast(`已选择优惠券：${coupon.name}`);
};

const showDelivery = () => {
  showDeliveryPopup.value = true;
};

// 规格选择相关方法
const getSpecOptions = productId => {
  const product = products.value.find(p => p.id === productId);
  if (!product || !product.specs) return [];

  return product.specs.map(spec => ({
    text: spec.name,
    value: spec.id
  }));
};

// 规格选择相关方法
const changeSpec = item => {
  currentCartItem.value = item;
  currentProduct.value = products.value.find(p => p.id === item.productId);
  selectedSpecId.value = item.specId;

  // 如果没有选中的规格，默认选择第一个
  if (!selectedSpecId.value && currentProduct.value?.specs?.length > 0) {
    selectedSpecId.value = currentProduct.value.specs[0].id;
  }

  showSpecPopup.value = true;
};

const selectSpec = spec => {
  selectedSpecId.value = spec.id;
};

// 获取选中规格的价格
const getSelectedSpecPrice = () => {
  if (!currentProduct.value || !selectedSpecId.value) return null;

  const spec = currentProduct.value.specs.find(
    s => s.id === selectedSpecId.value
  );
  return spec || null;
};

const confirmSpecChange = () => {
  if (!selectedSpecId.value || !currentCartItem.value || !currentProduct.value)
    return;

  const spec = currentProduct.value.specs.find(
    s => s.id === selectedSpecId.value
  );
  if (!spec) return;

  // 更新购物车项
  currentCartItem.value.specId = spec.id;
  currentCartItem.value.specName = spec.name;
  currentCartItem.value.price = spec.price;
  currentCartItem.value.originalPrice = spec.originalPrice;

  // 保存到本地存储
  localStorage.setItem("cartItems", JSON.stringify(cartItems.value));

  // 触发存储事件，通知其他页面更新购物车数量
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "cartItems",
      newValue: JSON.stringify(cartItems.value)
    })
  );

  showSpecPopup.value = false;
  showSuccessToast("规格更换成功");
};

const checkout = () => {
  if (selectedItems.value.length === 0) {
    showFailToast("请选择要结算的商品");
    return;
  }

  // 跳转到结算页面
  router.push("/checkout");
};

// 初始化
onMounted(() => {
  loadCartItems();

  // 确保每次进入页面时都是默认模式
  isEditMode.value = false;

  // 监听购物车数据变化
  window.addEventListener("storage", handleStorageChange);

  // 监听页面显示事件
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      loadCartItems();
    }
  });

  // 测试：检查购物车数据结构
  console.log("Cart page mounted, checking data structure...");
  if (cartItems.value.length > 0) {
    console.log("First cart item:", cartItems.value[0]);
    console.log("First item keys:", Object.keys(cartItems.value[0]));
  }
});

// 加载购物车数据
const loadCartItems = () => {
  const savedCart = localStorage.getItem("cartItems");
  if (savedCart) {
    cartItems.value = JSON.parse(savedCart);

    // 设置默认选中状态
    cartItems.value.forEach(item => {
      if (item.selected === undefined) {
        item.selected = true;
      }
      // 确保规格信息完整性，如果没有规格名称但有规格ID，尝试补充
      if (item.specId && !item.specName) {
        const product = products.value.find(
          p => p.id === item.productId || p.name === item.productName
        );
        if (product && product.specs) {
          const spec = product.specs.find(s => s.id === item.specId);
          if (spec) {
            item.specName = spec.name;
          }
        }
      }
    });
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
</script>

<style lang="less" scoped>
.cart-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100px;
}

.page-header {
  position: relative;
}

.fixed-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.cart-content {
  padding: 10px;
}

.delete-tip {
  background: #e8f4fd;
  border: 1px solid #b3d8f0;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #1989fa;

  .van-icon {
    font-size: 14px;
    flex-shrink: 0;
  }
}

.cart-items {
  margin-bottom: 15px;
}

.cart-item {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
}

.item-checkbox {
  flex-shrink: 0;
  margin-right: 2px;
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
}

.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0;
  line-height: 1.4;
}

.item-spec {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.item-quantity {
  display: flex;
  align-items: center;
}

.item-price {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.item-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-price {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.current-price {
  font-size: 16px;
  font-weight: 600;
  color: #ff4757;
}

.item-quantity {
  display: flex;
  align-items: center;
}

.item-total {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
  text-align: right;
  min-width: 80px;
}

.delete-btn {
  width: 100px;
  height: 100%;
  background: #ff4757;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: #e63946;
  }

  &:active {
    background: #d62f3d;
  }

  .van-icon {
    font-size: 24px;
    margin-bottom: 6px;
  }

  span {
    font-weight: 500;
  }
}

.coupon-section,
.delivery-section,
.remark-section {
  background: white;
  border-radius: 12px;
  margin-bottom: 15px;
  overflow: hidden;
}

.coupon-text,
.delivery-text {
  color: #1989fa;
}

.empty-cart {
  padding: 60px 20px;
  text-align: center;
}

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 15px 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-left {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.footer-center {
  flex: 1;
  min-width: 0;
}

.total-info {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;

  .total-price {
    font-size: 18px;
    font-weight: 600;
    color: #ff4757;
  }
}

.savings {
  font-size: 12px;
  color: #52c41a;
}

.savings-info {
  font-size: 12px;
  color: #666;
  margin-top: 2px;

  .savings-amount {
    color: #52c41a;
    font-weight: 500;
  }
}

.footer-right {
  flex-shrink: 0;
}

.selected-count {
  font-size: 14px;
  color: #666;
}

.checkout-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }

  &:active {
    transform: translateY(0);
  }
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 20px;
  padding: 12px 20px;
  font-weight: 500;
  transition: all 0.3s ease;

  .van-icon {
    font-size: 16px;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  }
}

.delete-selected-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 20px;
  padding: 12px 20px;
  font-weight: 500;
  transition: all 0.3s ease;

  .van-icon {
    font-size: 16px;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  }
}

.custom-confirm {
  padding: 30px;
  text-align: center;
  min-width: 300px;

  .confirm-icon {
    margin-bottom: 20px;

    .van-icon {
      font-size: 48px;
      color: #ff9800;
    }
  }

  .confirm-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
  }

  .confirm-message {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
    margin-bottom: 25px;
  }

  .confirm-actions {
    display: flex;
    gap: 15px;
    justify-content: center;

    .van-button {
      flex: 1;
      max-width: 120px;
      border-radius: 20px;
      font-weight: 500;
    }
  }
}

.coupon-popup,
.delivery-popup {
  padding: 20px;
  max-height: 60vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
}

.coupon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.coupon-item {
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &.active {
    border-color: #1989fa;
    background: #f0f9ff;
  }

  .coupon-amount {
    font-size: 18px;
    font-weight: 600;
    color: #ff4757;
    margin-bottom: 5px;
  }

  .coupon-condition {
    font-size: 12px;
    color: #666;
    margin-bottom: 5px;
  }

  .coupon-name {
    font-size: 12px;
    color: #333;
  }
}

.delivery-options {
  .van-cell {
    padding: 15px 0;
  }
}

.spec-popup {
  padding: 20px;
  max-height: 80vh;
}

.spec-content {
  .product-info {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 20px;

    .product-image {
      width: 60px;
      height: 60px;
      border-radius: 6px;
      object-fit: cover;
    }

    .product-details {
      flex: 1;

      .product-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
      }

      .product-price {
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
    }
  }

  .spec-options {
    margin-bottom: 20px;

    .spec-title {
      font-size: 14px;
      color: #333;
      margin-bottom: 15px;
      font-weight: 500;
    }

    .spec-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  .spec-actions {
    padding-top: 15px;
    border-top: 1px solid #eee;
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

:deep(.van-checkbox__label) {
  color: #333;
}

:deep(.van-stepper) {
  .van-stepper__minus,
  .van-stepper__plus {
    background: #f5f5f5;
    border: 1px solid #ddd;
  }

  .van-stepper__input {
    background: white;
    border: 1px solid #ddd;
  }
}
</style>

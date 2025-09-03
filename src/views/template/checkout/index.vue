<template>
  <div class="checkout-page">
    <!-- 页面标题 -->
    <van-nav-bar
      title="确认订单"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    />

    <!-- 收货地址 -->
    <div class="address-section">
      <div class="section-title">收货地址</div>
      <div class="address-content" @click="selectAddress">
        <div v-if="selectedAddress" class="address-info">
          <div class="address-header">
            <span class="name">{{ selectedAddress.name }}</span>
            <span class="phone">{{ selectedAddress.phone }}</span>
          </div>
          <div class="address-detail">{{ selectedAddress.address }}</div>
        </div>
        <div v-else class="no-address">
          <van-icon name="location-o" />
          <span>请选择收货地址</span>
        </div>
        <van-icon name="arrow" class="arrow-icon" />
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="products-section">
      <div class="section-title">商品信息</div>
      <div class="product-list">
        <div v-for="item in selectedItems" :key="item.id" class="product-item">
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
    </div>

    <!-- 配送方式 -->
    <div class="delivery-section">
      <div class="section-title">配送方式</div>
      <van-radio-group v-model="deliveryMethod">
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
      </van-radio-group>
    </div>

    <!-- 优惠券 -->
    <div class="coupon-section">
      <div class="section-title">优惠券</div>
      <div class="coupon-content" @click="selectCoupon">
        <span class="coupon-text">
          {{ selectedCoupon ? selectedCoupon.name : "未使用优惠券" }}
        </span>
        <van-icon name="arrow" class="arrow-icon" />
      </div>
    </div>

    <!-- 备注 -->
    <div class="remark-section">
      <div class="section-title">订单备注</div>
      <van-field
        v-model="remark"
        type="textarea"
        placeholder="请输入备注信息（选填）"
        rows="2"
        maxlength="100"
        show-word-limit
      />
    </div>

    <!-- 费用明细 -->
    <div class="cost-section">
      <div class="section-title">费用明细</div>
      <div class="cost-list">
        <div class="cost-item">
          <span>商品总价</span>
          <span>¥{{ subtotal.toFixed(2) }}</span>
        </div>
        <div v-if="deliveryFee > 0" class="cost-item">
          <span>配送费</span>
          <span>¥{{ deliveryFee.toFixed(2) }}</span>
        </div>
        <div v-if="couponDiscount > 0" class="cost-item">
          <span>优惠券</span>
          <span class="discount">-¥{{ couponDiscount.toFixed(2) }}</span>
        </div>
        <div class="cost-item total">
          <span>实付金额</span>
          <span class="total-price">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- 底部结算栏 -->
    <div class="bottom-bar">
      <div class="total-info">
        <span>合计：</span>
        <span class="total-price">¥{{ totalAmount.toFixed(2) }}</span>
      </div>
      <van-button
        type="primary"
        size="large"
        :loading="submitting"
        class="submit-btn"
        @click="submitOrder"
      >
        提交订单
      </van-button>
    </div>

    <!-- 地址选择弹窗 -->
    <van-popup v-model:show="showAddressPopup" position="bottom" round>
      <div class="address-popup">
        <div class="popup-header">
          <span>选择收货地址</span>
          <van-icon name="cross" @click="showAddressPopup = false" />
        </div>
        <div class="address-list">
          <div
            v-for="address in addressList"
            :key="address.id"
            class="address-item"
            :class="{ active: selectedAddress?.id === address.id }"
            @click="chooseAddress(address)"
          >
            <div class="address-header">
              <span class="name">{{ address.name }}</span>
              <span class="phone">{{ address.phone }}</span>
            </div>
            <div class="address-detail">{{ address.address }}</div>
          </div>
        </div>
        <div class="add-address">
          <van-button type="primary" block @click="addNewAddress">
            添加新地址
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 优惠券选择弹窗 -->
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
            @click="chooseCoupon(coupon)"
          >
            <div class="coupon-amount">¥{{ coupon.amount }}</div>
            <div class="coupon-condition">满{{ coupon.condition }}可用</div>
            <div class="coupon-name">{{ coupon.name }}</div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup name="Checkout">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showSuccessToast, showFailToast } from "vant";

const router = useRouter();
const route = useRoute();

// 选中的商品
const selectedItems = ref([]);
const selectedAddress = ref(null);
const deliveryMethod = ref("快递配送");
const selectedCoupon = ref(null);
const remark = ref("");

// 弹窗状态
const showAddressPopup = ref(false);
const showCouponPopup = ref(false);
const submitting = ref(false);

// 地址列表
const addressList = ref([
  {
    id: 1,
    name: "张三",
    phone: "13800138000",
    address: "北京市朝阳区某某街道某某小区1号楼101室"
  },
  {
    id: 2,
    name: "李四",
    phone: "13900139000",
    address: "上海市浦东新区某某路某某大厦A座2001室"
  }
]);

// 可用优惠券
const availableCoupons = ref([
  { id: 1, name: "新用户专享", amount: 10, condition: 100 },
  { id: 2, name: "满减优惠", amount: 20, condition: 200 },
  { id: 3, name: "会员专享", amount: 15, condition: 150 }
]);

// 计算属性
const subtotal = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});

const deliveryFee = computed(() => {
  return deliveryMethod.value === "快递配送" ? 10 : 0;
});

const couponDiscount = computed(() => {
  if (
    selectedCoupon.value &&
    subtotal.value >= selectedCoupon.value.condition
  ) {
    return selectedCoupon.value.amount;
  }
  return 0;
});

const totalAmount = computed(() => {
  return subtotal.value + deliveryFee.value - couponDiscount.value;
});

// 选择地址
const selectAddress = () => {
  showAddressPopup.value = true;
};

const chooseAddress = address => {
  selectedAddress.value = address;
  showAddressPopup.value = false;
};

const addNewAddress = () => {
  showSuccessToast("跳转到添加地址页面");
};

// 选择优惠券
const selectCoupon = () => {
  showCouponPopup.value = true;
};

const chooseCoupon = coupon => {
  selectedCoupon.value = coupon;
  showCouponPopup.value = false;
};

// 提交订单
const submitOrder = async () => {
  if (!selectedAddress.value) {
    showFailToast("请选择收货地址");
    return;
  }

  submitting.value = true;

  try {
    // 模拟提交订单
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 清空购物车中已结算的商品
    const existingCart = localStorage.getItem("cartItems");
    if (existingCart) {
      let cartItems = JSON.parse(existingCart);
      cartItems = cartItems.filter(
        item => !selectedItems.value.find(selected => selected.id === item.id)
      );
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }

    showSuccessToast("订单提交成功！");

    // 跳转到订单成功页面
    setTimeout(() => {
      router.push("/home");
    }, 1500);
  } catch (error) {
    showFailToast("订单提交失败，请重试");
  } finally {
    submitting.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 初始化
onMounted(() => {
  // 优先检查是否有立即购买的订单数据
  const currentOrder = localStorage.getItem("currentOrder");
  if (currentOrder) {
    try {
      const orderData = JSON.parse(currentOrder);
      selectedItems.value = orderData.items;
      
      // 清除立即购买的订单数据
      localStorage.removeItem("currentOrder");
    } catch (error) {
      console.error("解析订单数据失败:", error);
    }
  } else {
    // 从购物车获取选中的商品
    const cartItems = localStorage.getItem("cartItems");
    if (cartItems) {
      const allItems = JSON.parse(cartItems);
      selectedItems.value = allItems.filter(item => item.selected !== false);
    }
  }

  // 默认选择第一个地址
  if (addressList.value.length > 0) {
    selectedAddress.value = addressList.value[0];
  }
});
</script>

<style lang="less" scoped>
.checkout-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100px;
}

.address-section,
.products-section,
.delivery-section,
.coupon-section,
.remark-section,
.cost-section {
  background: white;
  margin-bottom: 10px;
  padding: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.address-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;

  .address-info {
    flex: 1;

    .address-header {
      margin-bottom: 8px;

      .name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-right: 15px;
      }

      .phone {
        font-size: 14px;
        color: #666;
      }
    }

    .address-detail {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }
  }

  .no-address {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #999;
    font-size: 14px;
  }

  .arrow-icon {
    color: #999;
    font-size: 16px;
  }
}

.product-list {
  .product-item {
    display: flex;
    gap: 15px;
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .product-image {
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

    .product-info {
      flex: 1;
      min-width: 0;

      .product-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .product-spec {
        font-size: 12px;
        color: #666;
        margin-bottom: 8px;
        background: #f5f5f5;
        padding: 2px 8px;
        border-radius: 4px;
        display: inline-block;
      }

      .product-price {
        display: flex;
        justify-content: space-between;
        align-items: center;

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
  }
}

.coupon-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;

  .coupon-text {
    font-size: 14px;
    color: #333;
  }

  .arrow-icon {
    color: #999;
    font-size: 16px;
  }
}

.cost-list {
  .cost-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    &.total {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      border-top: 2px solid #f0f0f0;
      padding-top: 15px;
      margin-top: 10px;

      .total-price {
        color: #ff4757;
        font-size: 20px;
      }
    }

    .discount {
      color: #52c41a;
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.total-info {
  font-size: 16px;
  color: #333;

  .total-price {
    font-size: 20px;
    font-weight: 600;
    color: #ff4757;
  }
}

.submit-btn {
  border-radius: 25px;
  padding: 12px 30px;
  font-weight: 600;
  background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 71, 87, 0.6);
  }

  &:active {
    transform: translateY(0);
  }
}

.address-popup,
.coupon-popup {
  padding: 20px;
  max-height: 70vh;
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

.address-list {
  margin-bottom: 20px;

  .address-item {
    padding: 15px;
    border: 2px solid #eee;
    border-radius: 8px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s;

    &.active {
      border-color: #1989fa;
      background: #f0f9ff;
    }

    .address-header {
      margin-bottom: 8px;

      .name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-right: 15px;
      }

      .phone {
        font-size: 14px;
        color: #666;
      }
    }

    .address-detail {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }
  }
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

:deep(.van-nav-bar) {
  background: #1989fa;

  .van-nav-bar__title {
    color: white;
  }

  .van-icon {
    color: white;
  }
}
</style>

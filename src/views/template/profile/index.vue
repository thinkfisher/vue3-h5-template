<template>
  <div class="profile-page">
    <!-- 用户信息头部 -->
    <div class="user-header">
      <div class="user-avatar">
        <van-icon name="user-o" />
      </div>
      <div class="user-info">
        <div class="username">{{ userInfo.username }}</div>
        <div class="user-desc">{{ userInfo.description }}</div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-list">
      <van-cell-group>
        <van-cell title="我的订单" is-link @click="goToOrders">
          <template #icon>
            <van-icon name="orders-o" class="menu-icon" />
          </template>
        </van-cell>
        <van-cell title="收货地址" is-link @click="goToAddress">
          <template #icon>
            <van-icon name="location-o" class="menu-icon" />
          </template>
        </van-cell>
        <van-cell title="优惠券" is-link @click="goToCoupons">
          <template #icon>
            <van-icon name="coupon-o" class="menu-icon" />
          </template>
        </van-cell>
        <van-cell title="客服中心" is-link @click="contactService">
          <template #icon>
            <van-icon name="service-o" class="menu-icon" />
          </template>
        </van-cell>
        <van-cell title="设置" is-link @click="goToSettings">
          <template #icon>
            <van-icon name="setting-o" class="menu-icon" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 退出登录按钮 -->
    <div class="logout-section">
      <van-button
        type="danger"
        size="large"
        block
        class="logout-btn"
        @click="showLogoutConfirm"
      >
        退出登录
      </van-button>
    </div>

    <!-- 退出确认弹框 -->
    <van-popup v-model:show="showLogoutPopup" position="center" round>
      <div class="custom-confirm">
        <div class="confirm-icon">
          <van-icon name="warning-o" />
        </div>
        <div class="confirm-title">确认退出</div>
        <div class="confirm-message">
          确定要退出登录吗？退出后将清除所有本地数据。
        </div>
        <div class="confirm-actions">
          <van-button size="large" @click="showLogoutPopup = false"
            >取消</van-button
          >
          <van-button size="large" type="danger" @click="logout"
            >确认退出</van-button
          >
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup name="Profile">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { showSuccessToast, showFailToast } from "vant";

const router = useRouter();

// 用户信息
const userInfo = ref({
  username: "用户123456",
  description: "欢迎使用液化气配送系统"
});

// 弹框状态
const showLogoutPopup = ref(false);

// 显示退出确认弹框
const showLogoutConfirm = () => {
  showLogoutPopup.value = true;
};

// 退出登录
const logout = () => {
  try {
    // 清除本地存储数据
    localStorage.removeItem("cartItems");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");

    // 清除其他相关数据
    sessionStorage.clear();

    showLogoutPopup.value = false;
    showSuccessToast("退出成功");

    // 跳转到登录页
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  } catch (error) {
    showFailToast("退出失败，请重试");
  }
};

// 跳转到订单页面
const goToOrders = () => {
  router.push("/orders");
};

// 跳转到地址页面
const goToAddress = () => {
  showSuccessToast("跳转到地址页面");
};

// 跳转到优惠券页面
const goToCoupons = () => {
  router.push("/coupons");
};

// 联系客服
const contactService = () => {
  showSuccessToast("联系客服");
};

// 跳转到设置页面
const goToSettings = () => {
  showSuccessToast("跳转到设置页面");
};
</script>

<style lang="less" scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100px;
}

.user-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
}

.user-avatar {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  .van-icon {
    font-size: 40px;
    color: white;
  }
}

.user-info {
  flex: 1;

  .username {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .user-desc {
    font-size: 14px;
    opacity: 0.9;
  }
}

.menu-list {
  margin: 20px 0;

  .menu-icon {
    font-size: 20px;
    color: #1989fa;
    margin-right: 10px;
  }
}

.logout-section {
  padding: 20px;

  .logout-btn {
    border-radius: 25px;
    font-weight: 500;
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
</style>

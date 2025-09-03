<template>
  <div class="home-container">
    <!-- 轮播Banner图 -->
    <div class="banner-section">
      <van-swipe class="banner-swipe" :autoplay="3000" indicator-color="white">
        <van-swipe-item v-for="(banner, index) in bannerList" :key="index">
          <div
            class="banner-item"
            :style="{ backgroundImage: `url(${banner.image})` }"
          >
            <div class="banner-content">
              <h3 class="banner-title">{{ banner.title }}</h3>
              <p class="banner-desc">{{ banner.description }}</p>
            </div>
          </div>
        </van-swipe-item>
      </van-swipe>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-entry-section">
      <h3 class="section-title">快捷入口</h3>
      <div class="quick-entry-grid">
        <div
          v-for="(entry, index) in quickEntries"
          :key="index"
          class="quick-entry-item"
          @click="
            entry.name === '更多'
              ? (showMorePopup = true)
              : navigateTo(entry.route)
          "
        >
          <div class="entry-icon">
            <van-icon :name="entry.icon" />
          </div>
          <span class="entry-text">{{ entry.name }}</span>
        </div>
      </div>
    </div>

    <!-- 更多示例页面弹窗 -->
    <van-popup
      v-model:show="showMorePopup"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div class="more-popup">
        <div class="popup-header">
          <h3>更多示例页面</h3>
          <van-icon name="cross" @click="showMorePopup = false" />
        </div>
        <div class="more-pages-grid">
          <div
            v-for="(page, index) in morePages"
            :key="index"
            class="more-page-item"
            @click="navigateToMore(page.route)"
          >
            <div class="page-icon">
              <van-icon :name="page.icon" />
            </div>
            <span class="page-text">{{ page.name }}</span>
            <span class="page-desc">{{ page.description }}</span>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 商品瀑布流 -->
    <div class="products-section">
      <h3 class="section-title">热门商品</h3>
      <div class="products-waterfall">
        <div
          v-for="(product, index) in productsList"
          :key="index"
          class="product-card"
          :style="{ height: product.height + 'px' }"
        >
          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
          </div>
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <p class="product-desc">{{ product.description }}</p>
            <div class="product-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ product.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="Home">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const showMorePopup = ref(false);

// Banner数据
const bannerList = reactive([
  {
    image: "https://img.yzcdn.cn/vant/cat.jpeg",
    title: "新品上市",
    description: "精选好物，限时特惠"
  },
  {
    image: "https://img.yzcdn.cn/vant/cat.jpeg",
    title: "热销推荐",
    description: "大家都在买的好物"
  },
  {
    image: "https://img.yzcdn.cn/vant/cat.jpeg",
    title: "品牌专区",
    description: "品质保证，值得信赖"
  }
]);

// 快捷入口数据
const quickEntries = reactive([
  { name: "商品列表", icon: "shop-o", route: "Products" },
  { name: "基础列表", icon: "orders-o", route: "BasicList" },
  { name: "用户列表", icon: "friends-o", route: "CardList" },
  { name: "基础表单", icon: "edit", route: "BasicForm" },
  { name: "定位查询", icon: "location-o", route: "LocationSearch" },
  { name: "统计图表", icon: "chart-trending-o", route: "EchartsDemo" },
  { name: "更多", icon: "arrow", route: "Demo" }
]);

// 更多示例页面数据
const morePages = reactive([
  {
    name: "功能介绍",
    icon: "info-o",
    route: "Demo",
    description: "查看所有功能特性"
  },
  {
    name: "工具中心",
    icon: "setting-o",
    route: "Tools",
    description: "实用工具集合"
  },
  {
    name: "关于我们",
    icon: "contact",
    route: "About",
    description: "了解更多信息"
  }
]);

// 商品数据
const productsList = reactive([
  {
    name: "时尚休闲包",
    description: "简约设计，实用百搭",
    price: "299",
    image: "https://img.yzcdn.cn/vant/cat.jpeg",
    height: 280
  },
  {
    name: "无线蓝牙耳机",
    description: "音质清晰，续航持久",
    price: "199",
    image: "https://img.yzcdn.cn/vant/cat.jpeg",
    height: 320
  },
  {
    name: "智能手表",
    description: "健康监测，运动追踪",
    price: "899",
    image: "https://img.yzcdn.cn/vant/cat.jpeg",
    height: 300
  },
  {
    name: "便携充电宝",
    description: "大容量，快充技术",
    price: "99",
    image: "https://img.yzcdn.cn/vant/cat.jpeg",
    height: 260
  },
  {
    name: "无线充电器",
    description: "便捷充电，智能识别",
    price: "159",
    image: "https://img.yzcdn.cn/vant/cat.jpeg",
    height: 290
  },
  {
    name: "蓝牙音箱",
    description: "立体声效，便携设计",
    price: "399",
    image: "https://img.yzcdn.cn/vant/cat.jpeg",
    height: 310
  }
]);

// 页面跳转
const navigateTo = routeName => {
  router.push({ name: routeName });
};

// 更多页面导航方法
const navigateToMore = route => {
  showMorePopup.value = false;
  router.push({ name: route });
};
</script>

<style lang="less" scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// Banner样式
.banner-section {
  margin-bottom: 16px;

  .banner-swipe {
    height: 180px;
    border-radius: 0 0 16px 16px;
    overflow: hidden;
  }

  .banner-item {
    height: 180px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        rgba(0, 0, 0, 0.3) 100%
      );
    }
  }

  .banner-content {
    position: absolute;
    bottom: 20px;
    left: 20px;
    color: white;

    .banner-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .banner-desc {
      font-size: 14px;
      opacity: 0.9;
    }
  }
}

// 快捷入口样式
.quick-entry-section {
  background: white;
  margin: 0 12px 16px;
  border-radius: 12px;
  padding: 20px 16px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    text-align: center;
  }

  .quick-entry-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .quick-entry-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    .entry-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;

      .van-icon {
        font-size: 24px;
        color: white;
      }
    }

    .entry-text {
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  }
}

// 商品瀑布流样式
.products-section {
  background: white;
  margin: 0 12px 16px;
  border-radius: 12px;
  padding: 20px 16px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    text-align: center;
  }

  .products-waterfall {
    column-count: 2;
    column-gap: 12px;

    .product-card {
      break-inside: avoid;
      margin-bottom: 12px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

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

        .product-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 6px;
          line-height: 1.4;
        }

        .product-desc {
          font-size: 12px;
          color: #999;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .product-price {
          display: flex;
          align-items: baseline;

          .price-symbol {
            font-size: 12px;
            color: #ff4757;
            margin-right: 2px;
          }

          .price-value {
            font-size: 16px;
            font-weight: 600;
            color: #ff4757;
          }
        }
      }
    }
  }
}

// 更多页面弹窗样式
.more-popup {
  padding: 20px;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .van-icon {
      font-size: 20px;
      color: #999;
      cursor: pointer;
      padding: 4px;
    }
  }

  .more-pages-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .more-page-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 16px;
      background: #f8f9fa;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: #e9ecef;
        transform: translateY(-2px);
      }

      .page-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;

        .van-icon {
          font-size: 24px;
          color: white;
        }
      }

      .page-text {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
        text-align: center;
      }

      .page-desc {
        font-size: 11px;
        color: #666;
        text-align: center;
        line-height: 1.3;
      }
    }
  }
}

// 响应式设计
@media (max-width: 375px) {
  .quick-entry-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .products-waterfall {
    column-count: 1;
  }
}
</style>

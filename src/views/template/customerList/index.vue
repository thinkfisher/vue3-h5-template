<script setup name="CardList">
import { ref, onMounted, nextTick } from "vue";
import { Card, showToast } from "vant";
import { mapConfig } from "@/config/map";

// 地图相关状态
const showMap = ref(false);
const currentLocation = ref({
  name: "",
  address: "",
  latitude: 0,
  longitude: 0
});

// 百度地图相关
const mapContainer = ref(null);
let map = null;
let marker = null;

// 用户数据
const userList = ref([
  {
    id: 1,
    name: "张三",
    phone: "88888888",
    type: "居民用户",
    address: "湖北省武汉市江夏区光谷大道43号",
    latitude: 30.5928,
    longitude: 114.3055,
    openTime: "2023-03-15"
  },
  {
    id: 2,
    name: "张亮麻辣烫",
    phone: "8888888",
    type: "非居/餐饮",
    address: "湖北省武汉市江夏区光谷大道43号",
    latitude: 30.5928,
    longitude: 114.3055,
    openTime: "2023-03-15"
  },
  {
    id: 3,
    name: "李四",
    phone: "66666666",
    type: "居民用户",
    address: "湖北省武汉市洪山区珞喻路129号",
    latitude: 30.526,
    longitude: 114.3615,
    openTime: "2023-02-20"
  },
  {
    id: 4,
    name: "星巴克咖啡",
    phone: "77777777",
    type: "非居/餐饮",
    address: "湖北省武汉市武昌区中南路99号",
    latitude: 30.547,
    longitude: 114.334,
    openTime: "2023-01-10"
  }
]);

// 加载百度地图API
const loadBaiduMap = () => {
  return new Promise((resolve, reject) => {
    if (window.BMap) {
      resolve(window.BMap);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://api.map.baidu.com/api?v=3.0&ak=${mapConfig.baiduMapAK}&callback=initBaiduMap`;
    script.onerror = reject;

    window.initBaiduMap = () => {
      resolve(window.BMap);
    };

    document.head.appendChild(script);
  });
};

// 初始化地图
const initMap = async () => {
  try {
    const BMap = await loadBaiduMap();

    // 确保地图容器存在且有尺寸
    if (!mapContainer.value) {
      throw new Error("地图容器不存在");
    }

    // 确保容器有尺寸
    const container = mapContainer.value;
    if (!container.offsetWidth || !container.offsetHeight) {
      // 如果容器没有尺寸，等待一下再试
      await new Promise(resolve => setTimeout(resolve, 200));
      if (!container.offsetWidth || !container.offsetHeight) {
        throw new Error("地图容器尺寸无效");
      }
    }

    // 创建地图实例
    map = new BMap.Map(container);

    // 设置地图中心点和缩放级别
    const point = new BMap.Point(
      currentLocation.value.longitude,
      currentLocation.value.latitude
    );
    map.centerAndZoom(point, mapConfig.defaultZoom);

    // 延迟添加地图控件，确保地图完全加载
    setTimeout(() => {
      try {
        if (map && BMap) {
          map.addControl(new BMap.NavigationControl());
          map.addControl(new BMap.ScaleControl());
          map.addControl(new BMap.OverviewMapControl());
          map.addControl(new BMap.MapTypeControl());
        }
      } catch (controlError) {
        console.warn("地图控件加载失败:", controlError);
      }
    }, 300);

    // 延迟添加标记点和信息窗口
    setTimeout(() => {
      try {
        if (map) {
          addMarker(point);
          addInfoWindow(point);
        }
      } catch (markerError) {
        console.warn("标记点加载失败:", markerError);
      }
    }, 500);
  } catch (error) {
    console.error("百度地图加载失败:", error);
    showToast("地图加载失败，请检查网络连接");
  }
};

// 添加标记点
const addMarker = point => {
  try {
    if (marker) {
      map.removeOverlay(marker);
    }

    // 创建标记点
    marker = new BMap.Marker(point);
    map.addOverlay(marker);

    // 设置更大的自定义图标
    try {
      // 创建一个更大的自定义图标
      const iconUrl =
        "data:image/svg+xml;base64," +
        btoa(`
        <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" fill="#1989fa" stroke="#fff" stroke-width="3"/>
          <circle cx="24" cy="24" r="8" fill="#fff"/>
        </svg>
      `);

      const icon = new BMap.Icon(iconUrl, new BMap.Size(48, 48));
      marker.setIcon(icon);
      console.log("大图标标记点添加成功");
    } catch (iconError) {
      console.warn("自定义图标设置失败，使用默认样式:", iconError);
      // 使用默认样式
    }
  } catch (error) {
    console.error("添加标记点失败:", error);
  }
};

// 添加信息窗口
const addInfoWindow = point => {
  try {
    if (!marker) {
      console.warn("标记点不存在，无法添加信息窗口");
      return;
    }

    const content = `
      <div style="padding: 10px; max-width: 200px;">
        <h4 style="margin: 0 0 5px 0; color: #333;">${currentLocation.value.name}</h4>
        <p style="margin: 0; color: #666; font-size: 12px;">${currentLocation.value.address}</p>
      </div>
    `;

    const infoWindow = new BMap.InfoWindow(content, {
      width: 220,
      height: 80,
      title: "位置信息"
    });

    marker.addEventListener("click", () => {
      try {
        if (map && infoWindow) {
          map.openInfoWindow(infoWindow, point);
        }
      } catch (windowError) {
        console.warn("打开信息窗口失败:", windowError);
      }
    });

    console.log("信息窗口添加成功");
  } catch (error) {
    console.error("添加信息窗口失败:", error);
  }
};

// 打开地图
const openMap = async user => {
  try {
    currentLocation.value = {
      name: user.name,
      address: user.address,
      latitude: user.latitude,
      longitude: user.longitude
    };
    showMap.value = true;

    // 等待DOM更新后初始化地图
    await nextTick();

    // 确保地图容器已经渲染并等待更长时间
    const waitForContainer = () => {
      return new Promise(resolve => {
        const checkContainer = () => {
          if (mapContainer.value && mapContainer.value.offsetWidth > 0) {
            resolve();
          } else {
            setTimeout(checkContainer, 50);
          }
        };
        checkContainer();
      });
    };

    await waitForContainer();
    await initMap();
  } catch (error) {
    console.error("打开地图失败:", error);
    showToast("打开地图失败，请重试");
  }
};

// 关闭地图
const closeMap = () => {
  showMap.value = false;
  // 清理地图实例
  if (map) {
    // 百度地图没有 destroy 方法，只需要清理引用
    map = null;
    marker = null;
  }
};

// 地图选择状态
const showMapSelector = ref(false);

// 导航到该地址
const navigateToLocation = () => {
  showMapSelector.value = true;
};

// 选择地图应用
const selectMapApp = mapType => {
  const { latitude, longitude, name, address } = currentLocation.value;
  let url = "";

  switch (mapType) {
    case "amap":
      // 高德地图
      url = `https://uri.amap.com/navigation?to=${longitude},${latitude},${name}&mode=car&policy=1&src=mypage&coordinate=gaode&callnative=0`;
      break;
    case "baidu":
      // 百度地图
      url = `https://api.map.baidu.com/direction?origin=&destination=${address}&mode=driving&region=武汉&output=html&src=webapp.baidu.openAPIdemo`;
      break;
    case "tencent":
      // 腾讯地图
      url = `https://apis.map.qq.com/uri/v1/routeplan?type=drive&to=${name}&tocoord=${latitude},${longitude}&referer=myapp`;
      break;
    case "google":
      // Google地图
      url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      break;
    default:
      return;
  }

  window.open(url, "_blank");
  showMapSelector.value = false;
  showToast("正在打开地图导航");
};

// 复制地址
const copyAddress = () => {
  const { address } = currentLocation.value;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(address).then(() => {
      showToast("地址已复制到剪贴板");
    });
  } else {
    // 兼容旧浏览器
    const textArea = document.createElement("textarea");
    textArea.value = address;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showToast("地址已复制到剪贴板");
  }
};

// 组件卸载时清理地图
onMounted(() => {
  return () => {
    if (map) {
      // 百度地图没有 destroy 方法，只需要清理引用
      map = null;
      marker = null;
    }
  };
});
</script>

<template>
  <div class="customer-page">
    <van-cell-group v-for="user in userList" :key="user.id" inset>
      <van-cell title-class="cell-title">
        <template #title>
          <i class="iconfont icon-geren" /> {{ user.name }}（{{ user.phone }}）
        </template>
        <template #value>
          <span class="customer-type">{{ user.type }}</span>
        </template>
      </van-cell>
      <van-cell :title="`电话：${user.phone}`" />
      <van-cell :title="`地址：${user.address}`">
        <template #right-icon>
          <van-icon
            name="location-o"
            class="location-icon"
            @click="openMap(user)"
          />
        </template>
      </van-cell>
      <van-cell title="开户时间" :value="user.openTime" />
    </van-cell-group>

    <!-- 地图弹窗 -->
    <van-popup
      v-model:show="showMap"
      position="bottom"
      :style="{ height: '80%' }"
      round
    >
      <div class="map-container">
        <div class="map-header">
          <h3>{{ currentLocation.name }}</h3>
          <p class="address">{{ currentLocation.address }}</p>
          <van-icon name="cross" class="close-btn" @click="closeMap" />
        </div>

        <div class="map-content">
          <!-- 百度地图容器 -->
          <div ref="mapContainer" class="baidu-map" />
        </div>

        <div class="map-actions">
          <van-button
            type="primary"
            block
            icon="location-o"
            @click="navigateToLocation"
          >
            导航到此地址
          </van-button>
          <van-button
            type="default"
            block
            icon="copy-o"
            class="copy-btn"
            @click="copyAddress"
          >
            复制地址
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 地图选择器弹窗 -->
    <van-action-sheet
      v-model:show="showMapSelector"
      title="选择地图应用"
      :actions="[
        { name: '高德地图', icon: 'location-o', color: '#00a6fb' },
        { name: '百度地图', icon: 'location-o', color: '#3385ff' },
        { name: '腾讯地图', icon: 'location-o', color: '#00c800' },
        { name: 'Google地图', icon: 'location-o', color: '#4285f4' }
      ]"
      cancel-text="取消"
      @select="
        (action, index) => {
          const mapTypes = ['amap', 'baidu', 'tencent', 'google'];
          selectMapApp(mapTypes[index]);
        }
      "
    />
  </div>
</template>

<style lang="less" scoped>
.customer-page {
  .customer-type {
    padding: 2px 4px;
    background: #43b9bd;
    border-radius: 2px;
    font-size: 12px;
    color: #fff;
  }

  .location-icon {
    color: #1989fa;
    font-size: 18px;
    cursor: pointer;

    &:hover {
      color: #007aff;
    }
  }

  /deep/ .van-cell__title.cell-title {
    flex: 3;
  }
}

.map-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .map-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    position: relative;

    h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .address {
      margin: 0;
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }

    .close-btn {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 20px;
      color: #999;
      cursor: pointer;

      &:hover {
        color: #333;
      }
    }
  }

  .map-content {
    flex: 1;
    position: relative;

    .baidu-map {
      width: 100%;
      height: 100%;
      min-height: 300px;
      min-width: 200px;
      display: block;
    }
  }

  .map-actions {
    padding: 20px;
    border-top: 1px solid #eee;

    .copy-btn {
      margin-top: 12px;
    }
  }
}
</style>

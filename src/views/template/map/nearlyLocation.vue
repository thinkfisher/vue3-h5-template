<script setup name="LocationSearch">
import { onMounted, onUnmounted, ref } from "vue";
import { Toast } from "vant";
import { showSuccessToast, showFailToast } from "vant";

// 初始化地图相关变量
const mapContainer = ref(null);
let map;
let marker = null;
let clientMarkers = [];
let circleOverlay = null;
let moveTimeout = null;
let hasInitializedMarker = false; // 标志变量，用于追踪是否已初始化标记

// 存储用户当前位置
const currentPosition = ref(null);
// 存储地图中心点（用于返回当前位置功能）
const centerPoint = ref(null);

const selectedRange = ref(1); // 默认选中附近1公里
const rangeOptions = [
  { text: "附近1公里", value: 1 },
  { text: "附近2公里", value: 2 },
  { text: "附近3公里", value: 3 }
];

// 客户列表和加载状态管理
const clients = ref([]);
const loading = ref(false);
const finished = ref(false);
const mapLoaded = ref(false); // 地图是否加载完成
const mapError = ref(false); // 地图是否加载失败

// 加载百度地图API
function loadBaiduMap() {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    if (window.BMapGL) {
      resolve(window.BMapGL);
      return;
    }

    // 检查是否正在加载
    if (window.BMapGLLoading) {
      const checkInterval = setInterval(() => {
        if (window.BMapGL) {
          clearInterval(checkInterval);
          resolve(window.BMapGL);
        }
      }, 100);
      return;
    }

    window.BMapGLLoading = true;

    const script = document.createElement("script");
    script.src = `https://api.map.baidu.com/api?type=webgl&v=1.0&ak=${import.meta.env.VITE_BAIDU_MAP_AK || "your_baidu_map_ak"}`;
    script.onload = () => {
      window.BMapGLLoading = false;
      // 等待BMapGL对象可用
      const checkBMapGL = setInterval(() => {
        if (window.BMapGL) {
          clearInterval(checkBMapGL);
          resolve(window.BMapGL);
        }
      }, 100);
    };
    script.onerror = () => {
      window.BMapGLLoading = false;
      reject(new Error("Failed to load Baidu Map API"));
    };
    document.head.appendChild(script);
  });
}

function initMap(mapContainer) {
  return new Promise((resolve, reject) => {
    try {
      const map = new BMapGL.Map(mapContainer);
      resolve(map);
    } catch (error) {
      reject(error);
    }
  });
}

// 浏览器定位，获取当前位置
function getCurrentPositionBuyBrower() {
  return new Promise((resolve, reject) => {
    const geolocation = new BMapGL.Geolocation();
    geolocation.getCurrentPosition(function (r) {
      if (this.getStatus() == BMAP_STATUS_SUCCESS) {
        resolve(r.point);
      } else {
        console.log("failed" + this.getStatus());
      }
    });
  });
}
// IP定位，获取当前位置
function getCurrentPositionBuyIP() {
  return new Promise((resolve, reject) => {
    function myFun(result) {
      const cityName = result.name;
      map.setCenter(cityName);
      alert("当前定位城市:" + cityName);
    }
    var myCity = new BMapGL.LocalCity();
    myCity.get(myFun);
  });
}

// 综合定位方法。优先用浏览器定位，如果没有获取到则调用SDK定位
async function getLocation() {
  try {
    // 尝试使用浏览器 Geolocation API
    return await getCurrentPositionBuyBrower();
  } catch (geolocationError) {
    try {
      // 如果在 SDK 环境中，尝试使用 SDK 获取位置
      const geolocation = new BMapGL.Geolocation();
      // 开启SDK辅助定位
      geolocation.enableSDKLocation();
      geolocation.getCurrentPosition(function (r) {
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
          return r;
          console.log("您的位置：" + r.point.lng + "," + r.point.lat);
        } else {
          console.log("failed" + this.getStatus());
        }
      });
    } catch (ipOrSDKError) {
      Toast.fail("无法获取位置，请检查网络连接或权限设置。");
      throw new Error("Unable to retrieve location.");
    }
  }
}

// 创建自定义图标函数
function createCustomIcon(index) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 40;
  canvas.height = 40;

  // 绘制圆圈作为背景
  ctx.beginPath();
  ctx.arc(20, 20, 15, 0, Math.PI * 2);
  ctx.fillStyle = "#FF7F50"; // 橙色背景
  ctx.fill();

  // 写入序号
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF"; // 白色文本
  ctx.fillText(index, 20, 20);

  // 将Canvas转换为Image对象
  const img = new Image();
  img.src = canvas.toDataURL("image/png");

  // 创建图标
  return new BMapGL.Icon(img, new BMapGL.Size(40, 40), {
    anchor: new BMapGL.Size(20, 20)
  });
}

// 初始化地图并添加事件监听器
async function initializeMap() {
  try {
    // 首先加载百度地图API
    await loadBaiduMap();

    const mapContainer = document.getElementById("mapContainer");
    if (!mapContainer) {
      throw new Error("Map container not found");
    }

    // 初始化地图
    map = await initMap(mapContainer);
    mapLoaded.value = true;

    // 设置初始中心点和缩放级别
    const point = await getLocation(); // 当前位置
    map.centerAndZoom(point, 15);
    map.enableScrollWheelZoom(true); // 启用滚轮放大缩小，默认禁用

    // 手动设置初始的中心点
    centerPoint.value = { lng: point.lng, lat: point.lat };
    currentPosition.value = { lng: point.lng, lat: point.lat };

    // 设置初始圆圈
    await saveCenterAndDrawCircle(selectedRange.value);

    // 添加地图移动事件监听器
    map.addEventListener("movestart", handleMoveStart);
    map.addEventListener("moveend", handleMoveEnd);

    // 初始化完成后立即加载数据
    await onLoad();
  } catch (err) {
    console.error("Map initialization failed:", err);
    mapError.value = true;
    showFailToast("地图初始化失败，请检查网络连接或刷新页面");
  }
}

const addOrUpdateMarker = point => {
  if (marker) {
    // 更新现有标记的位置
    marker.setPosition(point);
  } else if (!hasInitializedMarker) {
    // 创建新标记，并设置标记为已初始化
    marker = new BMapGL.Marker(point);
    map.addOverlay(marker);
    hasInitializedMarker = true;
  }
};

// 更新地图视野和圆圈范围
async function saveCenterAndDrawCircle(radiusKm) {
  if (!map) {
    return;
  }

  console.log("更新范围到:", radiusKm, "公里");

  // 清除之前的圆圈覆盖物
  if (circleOverlay) {
    map.removeOverlay(circleOverlay);
    circleOverlay = null;
  }

  const center = map.getCenter();
  currentPosition.value = { lng: center.lng, lat: center.lat };
  // 保存中心点用于返回当前位置功能
  centerPoint.value = { lng: center.lng, lat: center.lat };

  // 只在初始化时添加标记，避免覆盖已存在的标记
  if (!hasInitializedMarker) {
    addOrUpdateMarker(center);
  }

  // 创建新的圆圈覆盖物
  const radius = radiusKm * 1000; // 将公里转换为米

  circleOverlay = new BMapGL.Circle(center, radius, {
    strokeColor: "blue",
    strokeWeight: 2,
    strokeOpacity: 0.8, // 增加不透明度以便更容易看到
    fillColor: "rgba(0, 0, 255, 0.2)", // 使用 RGBA 颜色值增加透明度
    fillOpacity: 0.2
  });

  // 将新的圆圈添加到地图上
  map.addOverlay(circleOverlay);

  // 注意：这里不调用 onLoad()，避免重复加载客户数据
  // 只有在初始化或手动触发时才加载数据
}

// 返回当前位置
async function returnToCurrentPosition() {
  console.log("返回当前位置");

  try {
    // 获取设备的真实当前位置
    const currentLocation = await getLocation();

    if (!currentLocation) {
      showFailToast("无法获取当前位置");
      return;
    }

    console.log(
      "设置地图中心到当前位置:",
      currentLocation.lng,
      currentLocation.lat
    );
    map.setCenter(currentLocation);

    // 更新保存的中心点
    centerPoint.value = { lng: currentLocation.lng, lat: currentLocation.lat };
    currentPosition.value = {
      lng: currentLocation.lng,
      lat: currentLocation.lat
    };

    // 手动添加或更新当前位置标记
    if (marker) {
      marker.setPosition(currentLocation);
    } else {
      marker = new BMapGL.Marker(currentLocation);
      map.addOverlay(marker);
      hasInitializedMarker = true;
    }

    // 重新绘制圆圈
    await saveCenterAndDrawCircle(selectedRange.value);

    showSuccessToast(
      `已返回当前位置 (${currentLocation.lng.toFixed(4)}, ${currentLocation.lat.toFixed(4)})`
    );
  } catch (error) {
    console.error("返回位置失败:", error);
    showFailToast("返回位置失败");
  }
}
// 模拟从服务器获取最新客户位置数据的方法
async function fetchCustomerPosition() {
  // 这里应该是实际的数据请求逻辑
  // 返回值应为类似 { lng: number, lat: number } 的对象
  return new Promise(resolve => {
    setTimeout(() => {
      // 模拟异步获取数据
      resolve({
        lng: currentPosition.value.lng + (Math.random() - 0.5) / 80,
        lat: currentPosition.value.lat + (Math.random() - 0.5) / 80
      });
    }, 500);
  });
}

// 模拟加载附近客户数据
async function onLoad() {
  if (!mapLoaded.value) {
    console.log("Map not loaded yet, skipping data load");
    return;
  }

  loading.value = true;
  clients.value = [];
  if (clientMarkers && clientMarkers.length > 0) {
    clientMarkers.forEach(it => map.removeOverlay(it));
  }
  // 这里可以替换为实际的API调用
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (!currentPosition.value) {
    // 如果没有当前位置，使用默认坐标
    currentPosition.value = { lng: 116.404, lat: 39.915 };
  }

  // 模拟数据
  const fakeClients = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `客户${i + 1}`,
    phone: `1380013800${i % 10}`,
    address: `地址${i + 1}`,
    distance: Math.random() * selectedRange.value, // 随机生成距离，基于当前选择的范围
    location: new BMapGL.Point(
      currentPosition.value.lng +
        (Math.random() - 0.5) / (80 / selectedRange.value), // 根据范围调整位置分布
      currentPosition.value.lat +
        (Math.random() - 0.5) / (80 / selectedRange.value)
    )
  }));

  // 添加客户到地图
  fakeClients.forEach((client, index) => {
    const marker = new BMapGL.Marker(client.location, {
      icon: createCustomIcon(index + 1)
    });
    map.addOverlay(marker);
    clientMarkers.push(marker);
  });
  clients.value.push(...fakeClients);
  loading.value = false;

  if (clients.value.length >= 10) {
    finished.value = true;
  }
}

const handleMoveStart = () => {
  // 清除圆圈但保留标记
  if (circleOverlay) {
    map.removeOverlay(circleOverlay);
    circleOverlay = null;
  }
};

const handleMoveEnd = () => {
  if (moveTimeout) {
    clearTimeout(moveTimeout);
  }
  moveTimeout = setTimeout(() => {
    // 只更新圆圈和中心点，不重新加载客户数据
    saveCenterAndDrawCircle(selectedRange.value);
    // 移除 onLoad() 调用，避免重复添加图标
  }, 0);
};
// 清除所有覆盖物
const clearOverlays = () => {
  if (map) {
    // 移除所有的覆盖物
    const overlays = map.getOverlays();
    for (let overlay of overlays) {
      map.removeOverlay(overlay);
    }

    // 重置变量，确保不再引用旧的覆盖物
    circleOverlay = null;
    marker = null;
    currentPosition.value = null;
  }
};

// 点击客户列表项，将该地址设置为地图中心点
const selectClientLocation = client => {
  if (!map || !client.location) {
    showFailToast("无法定位到该地址");
    return;
  }

  try {
    // 将地图中心设置为选中的客户位置
    map.setCenter(client.location);

    // 设置合适的缩放级别
    map.setZoom(16);

    // 清除之前的圆圈
    if (circleOverlay) {
      map.removeOverlay(circleOverlay);
      circleOverlay = null;
    }

    // 在选中位置绘制新的圆圈
    const radius = selectedRange.value * 1000; // 将公里转换为米
    circleOverlay = new BMapGL.Circle(client.location, radius, {
      strokeColor: "red", // 使用红色表示选中的范围
      strokeWeight: 3,
      strokeOpacity: 0.8,
      fillColor: "rgba(255, 0, 0, 0.2)",
      fillOpacity: 0.2
    });

    map.addOverlay(circleOverlay);

    // 高亮显示选中的客户标记
    if (clientMarkers[client.id - 1]) {
      // 移除之前的高亮标记
      clientMarkers.forEach(marker => {
        if (marker._isHighlighted) {
          marker.setIcon(createCustomIcon(clientMarkers.indexOf(marker) + 1));
          marker._isHighlighted = false;
        }
      });

      // 高亮当前选中的标记
      const selectedMarker = clientMarkers[client.id - 1];
      if (selectedMarker) {
        // 创建高亮图标
        const highlightIcon = createHighlightIcon(client.id);
        if (highlightIcon) {
          selectedMarker.setIcon(highlightIcon);
          selectedMarker._isHighlighted = true;
        }
      }
    }

    showSuccessToast(`已定位到${client.name}的地址`);
  } catch (error) {
    console.error("设置地图中心点失败:", error);
    showFailToast("设置地图中心点失败");
  }
};

// 创建高亮图标
function createHighlightIcon(index) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 50; // 高亮图标稍大一些
  canvas.height = 50;

  // 绘制外圈光环
  ctx.beginPath();
  ctx.arc(25, 25, 22, 0, Math.PI * 2);
  ctx.strokeStyle = "#FFD700"; // 金色边框
  ctx.lineWidth = 3;
  ctx.stroke();

  // 绘制圆圈作为背景
  ctx.beginPath();
  ctx.arc(25, 25, 18, 0, Math.PI * 2);
  ctx.fillStyle = "#FF4500"; // 橙红色背景
  ctx.fill();

  // 写入序号
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF"; // 白色文本
  ctx.fillText(index, 25, 25);

  // 将Canvas转换为Image对象
  const img = new Image();
  img.src = canvas.toDataURL("image/png");

  // 创建图标
  return new BMapGL.Icon(img, new BMapGL.Size(50, 50), {
    anchor: new BMapGL.Size(25, 25)
  });
}

onMounted(() => {
  initializeMap();
});
onUnmounted(() => {
  if (map) {
    map.removeEventListener("movestart", handleMoveStart);
    map.removeEventListener("moveend", handleMoveEnd);

    clearOverlays(); // 确保组件卸载时移除所有覆盖物

    map = null;
  }
});
</script>

<template>
  <div class="map-page">
    <!-- 地图容器 -->
    <div id="mapContainer" ref="mapContainer" />

    <!-- 范围选择器 -->
    <div class="range-selector">
      <van-dropdown-menu>
        <van-dropdown-item
          v-model="selectedRange"
          :options="rangeOptions"
          @change="saveCenterAndDrawCircle"
        />
      </van-dropdown-menu>
      <!-- 调试信息 -->
      <div class="debug-info">
        <div>当前范围: {{ selectedRange }}公里</div>
        <div
          class="range-indicator"
          :style="{ width: selectedRange * 20 + 'px' }"
        />
        <div v-if="centerPoint" style="margin-top: 4px; font-size: 10px">
          保存位置: {{ centerPoint.lng.toFixed(4) }},
          {{ centerPoint.lat.toFixed(4) }}
        </div>
      </div>
    </div>

    <!-- 返回当前位置按钮 -->
    <i
      class="return-btn iconfont icon-huidaodangqianweizhi"
      @click="returnToCurrentPosition"
    />

    <!-- 错误提示 -->
    <div v-if="mapError" class="error-message">
      <van-icon name="warning-o" />
      <span>地图加载失败，请刷新页面重试</span>
    </div>

    <!-- 客户卡片列表 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      class="list"
      @load="onLoad"
    >
      <van-cell
        v-for="client in clients"
        :key="client.id"
        :title="`${client.name} - ${client.distance.toFixed(2)} km`"
        @click="selectClientLocation(client)"
      >
        <template #label>
          <p>电话: {{ client.phone }}</p>
          <p>地址: {{ client.address }}</p>
        </template>
      </van-cell>
    </van-list>
  </div>
</template>

<style lang="less" scoped>
.map-page {
  position: relative;
  height: calc(100vh - 105px);
  #mapContainer {
    width: 100%;
    height: 40%;
  }
  .list {
    height: 60%;
    overflow: auto;
  }
}

.range-selector {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1000;
  min-width: 120px;

  :deep(.van-dropdown-menu) {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.1);
    min-width: 120px;
  }

  :deep(.van-dropdown-menu__bar) {
    background: transparent;
    box-shadow: none;
    border: none;
    min-height: 36px;
  }

  :deep(.van-dropdown-menu__title) {
    color: #333;
    font-size: 14px;
    padding: 8px 16px;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.van-dropdown-menu__title::after) {
    border-color: #333 transparent transparent;
    margin-left: 8px;
  }

  .debug-info {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
    text-align: center;
    background: rgba(255, 255, 255, 0.8);
    padding: 4px 8px;
    border-radius: 4px;

    .range-indicator {
      height: 4px;
      background: linear-gradient(90deg, #4caf50, #ff9800, #f44336);
      border-radius: 2px;
      margin-top: 4px;
      transition: width 0.3s ease;
    }
  }
}

.return-btn {
  position: absolute;
  top: 33%;
  left: 0.5rem;
  font-size: 28px;
  color: #41b883;
  z-index: 9999;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;

  .van-icon {
    color: #ff6b6b;
    font-size: 20px;
  }
}
</style>

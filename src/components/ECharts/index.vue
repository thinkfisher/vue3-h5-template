<template>
  <div ref="chartRef" :style="{ width: '100%', height: '100%' }" />
</template>

<script setup>
import {
  ref,
  onMounted,
  watch,
  defineProps,
  nextTick,
  onBeforeUnmount
} from "vue";
import * as echarts from "echarts";

// 定义默认属性
const props = defineProps({
  options: {
    type: Object,
    required: true
  },
  theme: {
    type: String,
    default: "light"
  }
});

const chartRef = ref(null);
let chartInstance = null;

// 初始化图表
const initChart = () => {
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value, props.theme);
    renderChart();
    window.addEventListener("resize", resizeHandler);
  }
};

// 渲染图表
const renderChart = () => {
  if (chartInstance) {
    chartInstance.setOption(props.options);
  }
};

// 处理窗口大小改变事件
const resizeHandler = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// 监听选项变化以更新图表
watch(
  () => props.options,
  () => {
    nextTick(() => {
      renderChart();
    });
  },
  { deep: true }
);

onMounted(() => {
  nextTick(() => {
    initChart();
  });
});

// 在组件卸载时销毁实例和移除事件监听器
onBeforeUnmount(() => {
  if (chartInstance) {
    window.removeEventListener("resize", resizeHandler);
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style scoped>
/* 如果需要自定义样式 */
</style>

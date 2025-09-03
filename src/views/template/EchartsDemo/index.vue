<template>
  <div class="echarts-container">
    <!-- 图表类型选择器 -->
    <div class="chart-selector">
      <van-tabs v-model:active="activeTab" @change="onTabChange">
        <van-tab title="柱状图" name="bar">
          <div class="chart-wrapper">
            <ECharts :options="barChartOptions" />
          </div>
        </van-tab>
        <van-tab title="折线图" name="line">
          <div class="chart-wrapper">
            <ECharts :options="lineChartOptions" />
          </div>
        </van-tab>
        <van-tab title="饼图" name="pie">
          <div class="chart-wrapper">
            <ECharts :options="pieChartOptions" />
          </div>
        </van-tab>
        <van-tab title="雷达图" name="radar">
          <div class="chart-wrapper">
            <ECharts :options="radarChartOptions" />
          </div>
        </van-tab>
        <van-tab title="散点图" name="scatter">
          <div class="chart-wrapper">
            <ECharts :options="scatterChartOptions" />
          </div>
        </van-tab>
        <van-tab title="面积图" name="area">
          <div class="chart-wrapper">
            <ECharts :options="areaChartOptions" />
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup name="EchartsDemo">
import { reactive, ref } from "vue";
// 从 components 文件夹中导入 ECharts 组件
import ECharts from "../../../components/ECharts/index.vue";

const activeTab = ref("bar");

// 柱状图配置
const barChartOptions = reactive({
  title: {
    text: "月度销售数据",
    left: "center"
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow"
    }
  },
  legend: {
    data: ["销售额", "利润"],
    top: "10%"
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true
  },
  xAxis: {
    type: "category",
    data: [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月"
    ]
  },
  yAxis: {
    type: "value"
  },
  series: [
    {
      name: "销售额",
      type: "bar",
      data: [120, 200, 150, 80, 70, 110, 130, 180, 160, 140, 190, 220],
      itemStyle: {
        color: "#5470c6"
      }
    },
    {
      name: "利润",
      type: "bar",
      data: [20, 35, 25, 15, 12, 18, 22, 30, 28, 24, 32, 38],
      itemStyle: {
        color: "#91cc75"
      }
    }
  ]
});

// 折线图配置
const lineChartOptions = reactive({
  title: {
    text: "用户增长趋势",
    left: "center"
  },
  tooltip: {
    trigger: "axis"
  },
  legend: {
    data: ["新增用户", "活跃用户", "付费用户"],
    top: "10%"
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  },
  yAxis: {
    type: "value"
  },
  series: [
    {
      name: "新增用户",
      type: "line",
      stack: "Total",
      data: [120, 132, 101, 134, 90, 230, 210],
      smooth: true,
      lineStyle: {
        width: 3
      },
      itemStyle: {
        color: "#5470c6"
      }
    },
    {
      name: "活跃用户",
      type: "line",
      stack: "Total",
      data: [220, 182, 191, 234, 290, 330, 310],
      smooth: true,
      lineStyle: {
        width: 3
      },
      itemStyle: {
        color: "#91cc75"
      }
    },
    {
      name: "付费用户",
      type: "line",
      stack: "Total",
      data: [150, 232, 201, 154, 190, 330, 410],
      smooth: true,
      lineStyle: {
        width: 3
      },
      itemStyle: {
        color: "#fac858"
      }
    }
  ]
});

// 饼图配置
const pieChartOptions = reactive({
  title: {
    text: "产品市场份额",
    left: "center"
  },
  tooltip: {
    trigger: "item",
    formatter: "{a} <br/>{b}: {c} ({d}%)"
  },
  legend: {
    orient: "vertical",
    left: "left",
    top: "middle"
  },
  series: [
    {
      name: "市场份额",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "#fff",
        borderWidth: 2
      },
      label: {
        show: false,
        position: "center"
      },
      emphasis: {
        label: {
          show: true,
          fontSize: "18",
          fontWeight: "bold"
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 1048, name: "产品A", itemStyle: { color: "#5470c6" } },
        { value: 735, name: "产品B", itemStyle: { color: "#91cc75" } },
        { value: 580, name: "产品C", itemStyle: { color: "#fac858" } },
        { value: 484, name: "产品D", itemStyle: { color: "#ee6666" } },
        { value: 300, name: "产品E", itemStyle: { color: "#73c0de" } }
      ]
    }
  ]
});

// 雷达图配置
const radarChartOptions = reactive({
  title: {
    text: "能力评估雷达图",
    left: "center"
  },
  tooltip: {
    trigger: "item"
  },
  legend: {
    data: ["张三", "李四", "王五"],
    top: "10%"
  },
  radar: {
    indicator: [
      { name: "技术能力", max: 100 },
      { name: "沟通能力", max: 100 },
      { name: "学习能力", max: 100 },
      { name: "团队协作", max: 100 },
      { name: "解决问题", max: 100 },
      { name: "创新能力", max: 100 }
    ]
  },
  series: [
    {
      name: "能力评估",
      type: "radar",
      data: [
        {
          value: [85, 90, 88, 92, 87, 85],
          name: "张三",
          itemStyle: { color: "#5470c6" }
        },
        {
          value: [92, 85, 90, 88, 85, 90],
          name: "李四",
          itemStyle: { color: "#91cc75" }
        },
        {
          value: [88, 88, 85, 90, 92, 88],
          name: "王五",
          itemStyle: { color: "#fac858" }
        }
      ]
    }
  ]
});

// 散点图配置
const scatterChartOptions = reactive({
  title: {
    text: "身高体重分布",
    left: "center"
  },
  tooltip: {
    trigger: "item",
    formatter: function (params) {
      return `身高: ${params.data[0]}cm<br/>体重: ${params.data[1]}kg`;
    }
  },
  xAxis: {
    type: "value",
    name: "身高 (cm)",
    nameLocation: "middle",
    nameGap: 30
  },
  yAxis: {
    type: "value",
    name: "体重 (kg)",
    nameLocation: "middle",
    nameGap: 30
  },
  series: [
    {
      name: "身高体重",
      type: "scatter",
      data: [
        [160, 50],
        [165, 55],
        [170, 60],
        [175, 65],
        [180, 70],
        [155, 48],
        [160, 52],
        [165, 58],
        [170, 63],
        [175, 68],
        [150, 45],
        [155, 50],
        [160, 55],
        [165, 60],
        [170, 65],
        [180, 75],
        [185, 80],
        [190, 85],
        [195, 90],
        [200, 95]
      ],
      itemStyle: {
        color: "#5470c6",
        opacity: 0.7
      },
      symbolSize: 8
    }
  ]
});

// 面积图配置
const areaChartOptions = reactive({
  title: {
    text: "收入支出趋势",
    left: "center"
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
      label: {
        backgroundColor: "#6a7985"
      }
    }
  },
  legend: {
    data: ["收入", "支出", "净收入"],
    top: "10%"
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月"
    ]
  },
  yAxis: {
    type: "value"
  },
  series: [
    {
      name: "收入",
      type: "line",
      stack: "Total",
      areaStyle: {
        opacity: 0.3
      },
      data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330],
      smooth: true,
      lineStyle: {
        width: 0
      },
      itemStyle: {
        color: "#5470c6"
      }
    },
    {
      name: "支出",
      type: "line",
      stack: "Total",
      areaStyle: {
        opacity: 0.3
      },
      data: [80, 100, 70, 90, 60, 150, 130, 110, 120, 140, 180, 200],
      smooth: true,
      lineStyle: {
        width: 0
      },
      itemStyle: {
        color: "#ee6666"
      }
    },
    {
      name: "净收入",
      type: "line",
      stack: "Total",
      areaStyle: {
        opacity: 0.3
      },
      data: [40, 32, 31, 44, 30, 80, 80, 72, 71, 94, 110, 130],
      smooth: true,
      lineStyle: {
        width: 0
      },
      itemStyle: {
        color: "#91cc75"
      }
    }
  ]
});

// 切换图表类型
const onTabChange = name => {
  activeTab.value = name;
};
</script>

<style lang="less" scoped>
.echarts-container {
  width: 100%;
  height: 100vh;
  padding: 20px;
  background: #f5f5f5;
}

.chart-selector {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-wrapper {
  width: 100%;
  height: 400px;
  padding: 20px;
}

:deep(.van-tabs__wrap) {
  background: #f8f9fa;
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
</style>

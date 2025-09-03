<script setup name="BasicList">
import { ref, reactive } from "vue";
import { getConsumptionRecords, getListApi } from "@/api/mock/index.js";
const activeTab = reactive(1);

const list = ref([]);
const total = ref(0);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

const onLoad = () => {
  // 请求列表数据
  getData();
};
const onRefresh = () => {
  // 清空列表数据
  finished.value = false;

  // 重新加载数据
  // 将 loading 设置为 true，表示处于加载状态
  loading.value = true;
  onLoad();
};
// 请求列表数据
async function getData() {
  try {
    const res = await getConsumptionRecords({});
    if (res && res.list) list.value = res.list;
    if (res && res.total) total.value = res.total;
    // 加载状态结束
    loading.value = false;
    refreshing.value = false;

    // 数据全部加载完成
    if (list.value.length >= total.value) {
      finished.value = true;
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    loading.value = false;
    refreshing.value = false;
  }
}
</script>

<template>
  <div class="basic-list-page">
    <div class="top">
      <div class="title">储值余额</div>
      <div class="main">
        <div class="balance">￥88.00</div>
        <van-button class="btn" size="small" round>立即充值</van-button>
      </div>
      <div class="desc">总充值金额：￥1300.00 赠送金额：￥30.00</div>
    </div>
    <van-tabs v-model:active="activeTab">
      <van-tab title="充值记录">充值记录</van-tab>
      <van-tab title="消费记录">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <van-cell-group>
              <van-cell
                v-for="item in list"
                :title="`订单：${item.orderNo}`"
                :value="`消费 ￥${item.num}`"
                :label="item.time"
                is-link
              />
            </van-cell-group>
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
  </div>
</template>

<style lang="less" scoped>
.basic-list-page {
  .top {
    width: 100%;
    height: 115px;
    padding: 8px 24px;
    background: linear-gradient(287deg, #1b9ba5 0%, #4eb8c7);
    color: #fff;
    .title {
      font-size: 14px;
    }
    .main {
      font-size: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .btn {
        color: #1b9ba5;
      }
    }
    .desc {
      font-size: 12px;
    }
  }
}
</style>

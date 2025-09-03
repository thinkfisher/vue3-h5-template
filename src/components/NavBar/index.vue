<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useDarkMode, useToggleDarkMode } from "@/hooks/useToggleDarkMode";

const onClickRight = () => {
  useToggleDarkMode();
};
const onClickLeft = () => history.back();
const route = useRoute();
const pageTitle = ref(""); // 页面标题
// 初始化页面标题
const updateTitle = () => {
  pageTitle.value = route.meta.title || "";
  document.title = pageTitle.value;
};
// 监听路由变化并更新标题
watch(route, updateTitle, { immediate: true });
// 组件挂载时更新一次标题
onMounted(updateTitle);
</script>

<template>
  <van-nav-bar
    :title="pageTitle"
    left-text="返回"
    left-arrow
    fixed
    placeholder
    @click-left="onClickLeft"
    @click-right="onClickRight"
  >
    <template #right>
      <svg-icon class="text-[18px]" :name="useDarkMode() ? 'light' : 'dark'" />
    </template>
  </van-nav-bar>
</template>

<style scoped></style>

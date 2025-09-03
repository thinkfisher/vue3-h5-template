import { createRouter, createWebHashHistory } from "vue-router";
import routes from "./routes";
import { useCachedViewStoreHook } from "@/store/modules/cachedView";
import { useUserStore } from "@/store/modules/user";
import NProgress from "@/utils/progress";
import setPageTitle from "@/utils/set-page-title";

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  NProgress.start();

  // 路由缓存
  useCachedViewStoreHook().addCachedView(to);
  // 页面 title
  setPageTitle(to.meta.title);

  // 检查是否需要登录验证
  if (to.meta.requiresAuth) {
    // 检查本地存储中是否有token
    const token = localStorage.getItem("token");
    if (!token) {
      // 需要登录但未登录，重定向到登录页
      next("/login");
      return;
    }
  }

  // 登录页面始终允许访问，不进行重定向

  // 其他情况正常放行
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { loginApi, getUserInfoApi, logoutApi } from "@/api/user";

export const useUserStore = defineStore("user", () => {
  // 状态
  const token = ref(localStorage.getItem("token") || "");
  const userInfo = ref({});
  const isLogin = computed(() => !!token.value);

  // 登录
  const login = async loginForm => {
    try {
      const response = await loginApi(loginForm);
      const { token: newToken, user } = response;

      // 保存token
      token.value = newToken;
      localStorage.setItem("token", newToken);

      // 保存用户信息
      userInfo.value = user;

      return response;
    } catch (error) {
      throw error;
    }
  };

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const response = await getUserInfoApi();
      userInfo.value = response;
      return response;
    } catch (error) {
      throw error;
    }
  };

  // 登出
  const logout = async () => {
    try {
      if (token.value) {
        await logoutApi();
      }
    } catch (error) {
      console.error("登出失败:", error);
    } finally {
      // 清除本地数据
      token.value = "";
      userInfo.value = {};
      localStorage.removeItem("token");
    }
  };

  // 清除用户信息
  const clearUserInfo = () => {
    token.value = "";
    userInfo.value = {};
    localStorage.removeItem("token");
  };

  return {
    token,
    userInfo,
    isLogin,
    login,
    getUserInfo,
    logout,
    clearUserInfo
  };
});

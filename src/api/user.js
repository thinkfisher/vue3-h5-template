import { http } from "@/utils/http";

// 登录
export function loginApi(data) {
  return http.request({
    url: "/dev-api/user/login",
    method: "post",
    data
  });
}

// 获取用户信息
export function getUserInfoApi() {
  return http.request({
    url: "/dev-api/user/info",
    method: "get"
  });
}

// 登出
export function logoutApi() {
  return http.request({
    url: "/dev-api/user/logout",
    method: "post"
  });
}

// 修改密码
export function changePasswordApi(data) {
  return http.request({
    url: "/dev-api/user/change-password",
    method: "post",
    data
  });
}

// 更新用户信息
export function updateUserInfoApi(data) {
  return http.request({
    url: "/dev-api/user/update",
    method: "put",
    data
  });
}

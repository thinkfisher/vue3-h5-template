import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock([
  {
    url: "/dev-api/user/login",
    method: "POST",
    body: ({ body }) => {
      const { username, password } = body;

      // 模拟登录验证
      if (username === "admin" && password === "123456") {
        return {
          code: 200,
          message: "登录成功",
          data: {
            token: "mock-token-" + Date.now(),
            user: {
              id: 1,
              username: "admin",
              nickname: "管理员",
              avatar: "https://img.yzcdn.cn/vant/cat.jpeg",
              email: "admin@example.com",
              phone: "13800138000",
              role: "admin",
              permissions: ["dashboard", "user", "system"]
            }
          }
        };
      } else {
        return {
          code: 401,
          message: "用户名或密码错误",
          data: null
        };
      }
    }
  },

  {
    url: "/dev-api/user/info",
    method: "GET",
    body: () => {
      return {
        code: 200,
        message: "获取成功",
        data: {
          id: 1,
          username: "admin",
          nickname: "管理员",
          avatar: "https://img.yzcdn.cn/vant/cat.jpeg",
          email: "admin@example.com",
          phone: "13800138000",
          role: "admin",
          permissions: ["dashboard", "user", "system"],
          createTime: "2024-01-01 00:00:00",
          lastLoginTime: "2024-01-15 10:30:00"
        }
      };
    }
  },

  {
    url: "/dev-api/user/logout",
    method: "POST",
    body: () => {
      return {
        code: 200,
        message: "登出成功",
        data: null
      };
    }
  },

  {
    url: "/dev-api/user/change-password",
    method: "POST",
    body: () => {
      return {
        code: 200,
        message: "密码修改成功",
        data: null
      };
    }
  },

  {
    url: "/dev-api/user/update",
    method: "PUT",
    body: ({ body }) => {
      return {
        code: 200,
        message: "更新成功",
        data: body
      };
    }
  }
]);

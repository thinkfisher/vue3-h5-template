import Layout from "@/layout/index.vue";
import Demo from "@/views/demo/index.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录",
      noAuth: true
    }
  },
  {
    path: "/",
    name: "root",
    component: Layout,
    redirect: { name: "Home" },
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/home/index.vue"),
        meta: {
          title: "首页"
        }
      },
      {
        path: "demo",
        name: "Demo",
        component: Demo,
        meta: {
          title: "功能介绍"
        }
      },
      {
        path: "basicList",
        name: "BasicList",
        component: () => import("@/views/template/basicList/index.vue"),
        meta: {
          title: "基础列表"
        }
      },
      {
        path: "cardList",
        name: "CardList",
        component: () => import("@/views/template/customerList/index.vue"),
        meta: {
          title: "用户列表"
        }
      },
      {
        path: "basicForm",
        name: "BasicForm",
        component: () => import("@/views/template/basicForm/index.vue"),
        meta: {
          title: "基础表单"
        }
      },
      {
        path: "locationSearch",
        name: "LocationSearch",
        component: () => import("@/views/template/map/nearlyLocation.vue"),
        meta: {
          title: "定位查询"
        }
      },
      {
        path: "echartsDemo",
        name: "EchartsDemo",
        component: () => import("@/views/template/EchartsDemo/index.vue"),
        meta: {
          title: "ECharts统计图"
        }
      },
      {
        path: "products",
        name: "Products",
        component: () => import("@/views/template/products/index.vue"),
        meta: {
          title: "商品列表"
        }
      },
      {
        path: "cart",
        name: "Cart",
        component: () => import("@/views/template/cart/index.vue"),
        meta: {
          title: "购物车"
        }
      },
      {
        path: "product-detail/:id",
        name: "ProductDetail",
        component: () => import("@/views/template/productDetail/index.vue"),
        meta: {
          title: "商品详情"
        }
      },
      {
        path: "checkout",
        name: "Checkout",
        component: () => import("@/views/template/checkout/index.vue"),
        meta: {
          title: "确认订单"
        }
      },
      {
        path: "orders",
        name: "Orders",
        component: () => import("@/views/template/orders/index.vue"),
        meta: {
          title: "我的订单"
        }
      },
      {
        path: "order-detail/:id",
        name: "OrderDetail",
        component: () => import("@/views/template/orderDetail/index.vue"),
        meta: {
          title: "订单详情"
        }
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/template/profile/index.vue"),
        meta: {
          title: "我的"
        }
      },
      {
        path: "tools",
        name: "Tools",
        component: () => import("@/views/tools/index.vue"),
        meta: {
          title: "工具"
        }
      },
      {
        path: "about",
        name: "About",
        component: () => import("@/views/about/index.vue"),
        meta: {
          title: "关于",
          noCache: true
        }
      }
    ]
  }
];

export default routes;

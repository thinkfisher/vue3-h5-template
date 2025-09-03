// 地图配置
export const mapConfig = {
  // 百度地图API密钥 - 支持环境变量配置
  // 申请地址：https://lbsyun.baidu.com/apiconsole/key
  baiduMapAK:
    import.meta.env.VITE_BAIDU_MAP_AK || "zljP8IQr4tGYh2K1b7TKcETgPtZgN5LK",

  // 地图默认配置
  defaultZoom: 15,
  defaultCenter: {
    latitude: 30.5928,
    longitude: 114.3055
  }
};

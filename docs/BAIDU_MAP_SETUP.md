# 百度地图集成配置说明

## 1. 申请百度地图API密钥

### 步骤：
1. 访问 [百度地图开放平台](https://lbsyun.baidu.com/)
2. 注册并登录账号
3. 进入 [控制台](https://lbsyun.baidu.com/apiconsole/key)
4. 点击"创建应用"
5. 填写应用信息：
   - 应用名称：你的项目名称
   - 应用类型：选择"浏览器端"
   - 安全域名：添加你的域名（开发时可添加 `localhost`）
6. 创建完成后获取API密钥（AK）

## 2. 配置API密钥

### 方法一：修改配置文件
编辑 `src/config/map.js` 文件：
```javascript
export const mapConfig = {
  // 将 YOUR_BAIDU_MAP_AK 替换为你的实际API密钥
  baiduMapAK: '你的百度地图API密钥',
  
  // 其他配置...
};
```

### 方法二：环境变量（推荐）
1. 在项目根目录创建 `.env.local` 文件：
```bash
VITE_BAIDU_MAP_AK=你的百度地图API密钥
```

2. 修改 `src/config/map.js`：
```javascript
export const mapConfig = {
  baiduMapAK: import.meta.env.VITE_BAIDU_MAP_AK || 'YOUR_BAIDU_MAP_AK',
  // 其他配置...
};
```

## 3. 功能特性

### 已实现的功能：
- ✅ 真实百度地图显示
- ✅ 用户位置标记
- ✅ 地图控件（缩放、比例尺、缩略图、图层切换）
- ✅ 点击标记显示信息窗口
- ✅ 多地图应用导航选择
- ✅ 地址复制功能

### 地图控件说明：
- **导航控件**：地图左上角的缩放按钮
- **比例尺**：地图左下角的比例尺显示
- **缩略图**：地图右下角的小地图
- **图层切换**：地图右上角的图层选择

## 4. 注意事项

### 安全域名配置：
- 开发环境：添加 `localhost` 到安全域名
- 生产环境：添加你的实际域名
- 支持通配符：`*.yourdomain.com`

### API使用限制：
- 免费版每日配额：30,000次
- 超出配额需要升级付费版
- 建议在生产环境使用付费版

### 浏览器兼容性：
- 支持所有现代浏览器
- IE9+ 支持
- 移动端浏览器支持良好

## 5. 故障排除

### 地图无法加载：
1. 检查API密钥是否正确
2. 确认安全域名配置
3. 检查网络连接
4. 查看浏览器控制台错误信息

### 标记点不显示：
1. 确认经纬度坐标正确
2. 检查地图容器尺寸
3. 确认地图已完全加载

### 信息窗口不显示：
1. 检查点击事件绑定
2. 确认信息窗口内容格式正确

## 6. 扩展功能

### 可以添加的功能：
- 路线规划
- 地理编码（地址转坐标）
- 逆地理编码（坐标转地址）
- 周边搜索
- 热力图
- 自定义地图样式

### 示例代码：
```javascript
// 路线规划
const driving = new BMap.DrivingRoute(map, {
  renderOptions: { map: map, autoViewport: true }
});
driving.search(startPoint, endPoint);

// 地理编码
const geoc = new BMap.Geocoder();
geoc.getPoint(address, function(point) {
  if (point) {
    map.centerAndZoom(point, 16);
  }
});
```




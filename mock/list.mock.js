import { defineMock } from "vite-plugin-mock-dev-server";
import Mock from "mockjs";

export default defineMock([
  {
    url: "/dev-api/list/get",
    delay: 500,
    body: {
      code: 200,
      message: "OK",
      result: Mock.mock({
        "list|10": [
          {
            "id|+1": 1
          }
        ]
      })
    }
  },
  {
    url: "/dev-api/list/error",
    delay: 500,
    body: {
      code: 40010,
      message: "ERROR",
      result: null
    }
  },
  {
    url: "/dev-api/consumption/records",
    delay: 500,
    body: {
      code: 200,
      message: "OK",
      result: Mock.mock({
        list: [
          { orderNo: "11111111", time: "2024-12-09 17:18:18", num: 66.0 },
          { orderNo: "22222222", time: "2024-12-09 17:10:18", num: 77.0 },
          { orderNo: "33333333", time: "2024-12-09 14:18:18", num: 88.0 },
          { orderNo: "44444444", time: "2024-12-09 10:18:18", num: 99.0 },
          { orderNo: "55555555", time: "2024-12-08 10:18:18", num: 100.0 }
        ],
        total: 5
      })
    }
  }
]);

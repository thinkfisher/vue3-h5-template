import { http } from "@/utils/http";

export function getListApi(params) {
  return http.request({
    url: "/dev-api/list/get",
    method: "get",
    params
  });
}

export function getListApiError(params) {
  return http.request({
    url: "/dev-api/list/error",
    method: "post",
    params
  });
}
export function getConsumptionRecords(params) {
  return http.request({
    url: "/dev-api/consumption/records",
    method: "get",
    params
  });
}

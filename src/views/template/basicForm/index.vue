<script setup name="BasicForm">
import { ref, reactive } from "vue";
import { closeToast, showLoadingToast, Toast } from "vant";
import { areaList } from "@vant/area-data";

// 表单数据
const formData = reactive({
  checked1: false,
  checkbox: false,
  value1: "",
  value2: "",
  value3: "",
  value4: "",
  checked: false,
  groupChecked: [],
  checkboxGroup: [],
  radio: "",
  stepper: 1,
  rating: 0,
  slider: 50,
  files: [],
  city: "",
  time: "",
  area: "",
  calendar: ""
});
const pattern = /^\d{6}$/;
// 城市选择器
const cityPickerValue = ref([]);
const showPicker = ref(false);
const cityColumns = [
  { text: "杭州", value: "Hangzhou" },
  { text: "宁波", value: "Ningbo" },
  { text: "温州", value: "Wenzhou" },
  { text: "绍兴", value: "Shaoxing" },
  { text: "湖州", value: "Huzhou" }
];
const cityConfirm = ({ selectedValues, selectedOptions }) => {
  formData.city = selectedOptions[0]?.text;
  cityPickerValue.value = selectedValues;
  showPicker.value = false;
};
// 日期选择器
const timePicker = ref(false);
const timePickerValue = ref([]);
const timeConfirm = ({ selectedValues }) => {
  formData.time = selectedValues.join("/");
  timePickerValue.value = selectedValues;
  timePicker.value = false;
};
// 地区选择器
const showArea = ref(false);
const areaPickerValue = ref([]);
const areaConfirm = ({ selectedValues, selectedOptions }) => {
  areaPickerValue.value = selectedValues.length
    ? selectedValues[selectedValues.length - 1]
    : "";
  showArea.value = false;
  formData.area = selectedOptions.map(item => item.text).join("/");
};
// 日历选择器
const showCalendar = ref(false);
const calendarConfirm = date => {
  formData.calendar = `${date.getMonth() + 1}/${date.getDate()}`;
  showCalendar.value = false;
};

// 校验函数返回 true 表示校验通过，false 表示不通过
const validator = val => /1\d{10}/.test(val);

// 校验函数可以直接返回一段错误提示
const validatorMessage = val => `${val} 不合法，请重新输入`;

// 校验函数可以返回 Promise，实现异步校验
const asyncValidator = val =>
  new Promise(resolve => {
    showLoadingToast("验证中...");

    setTimeout(() => {
      closeToast();
      resolve(val === "1234");
    }, 1000);
  });

// 提交表单
const onSubmit = async values => {
  console.log("submit", values);
};

const onFailed = errorInfo => {
  console.log("failed", errorInfo);
};
</script>

<template>
  <van-form @submit="onSubmit" @failed="onFailed">
    <van-cell-group inset>
      <!-- 通过 pattern 进行正则校验 -->
      <van-field
        v-model="formData.value1"
        name="pattern"
        placeholder="正则校验"
        :rules="[{ pattern, message: '请输入6位数字' }]"
      />
      <!-- 通过 validator 进行函数校验 -->
      <van-field
        v-model="formData.value2"
        name="validator"
        placeholder="函数校验手机号号"
        :rules="[{ validator, message: '请输入正确内容' }]"
      />
      <!-- 通过 validator 返回错误提示 -->
      <van-field
        v-model="formData.value3"
        name="validatorMessage"
        placeholder="校验函数返回错误提示"
        :rules="[{ validator: validatorMessage }]"
      />
      <!-- 通过 validator 进行异步函数校验 -->
      <van-field
        v-model="formData.value4"
        name="asyncValidator"
        placeholder="异步函数校验"
        :rules="[{ validator: asyncValidator, message: '请输入正确内容' }]"
      />
      <van-field name="switch" label="开关">
        <template #input>
          <van-switch v-model="formData.checked1" />
        </template>
      </van-field>
      <van-field name="checkbox" label="复选框">
        <template #input>
          <van-checkbox v-model="formData.checkedbox" shape="square" />
        </template>
      </van-field>
      <van-field name="checkboxGroup" label="复选框组">
        <template #input>
          <van-checkbox-group
            v-model="formData.groupChecked"
            direction="horizontal"
          >
            <van-checkbox name="1" shape="square">复选框 1</van-checkbox>
            <van-checkbox name="2" shape="square">复选框 2</van-checkbox>
          </van-checkbox-group>
        </template>
      </van-field>

      <!-- 单选框 -->
      <van-field
        required
        name="radio"
        label="单选框"
        :rules="[{ required: true, message: '请输入' }]"
      >
        <template #input>
          <van-radio-group v-model="formData.radio" direction="horizontal">
            <van-radio name="1">单选框 1</van-radio>
            <van-radio name="2">单选框 2</van-radio>
          </van-radio-group>
        </template>
      </van-field>

      <!-- 步进器 -->
      <van-field name="stepper" label="步进器">
        <template #input>
          <van-stepper v-model="formData.stepper" />
        </template>
      </van-field>

      <!-- 评分 -->
      <van-field name="rate" label="评分">
        <template #input>
          <van-rate v-model="formData.rating" />
        </template>
      </van-field>

      <!-- 滑块 -->
      <van-field name="slider" label="滑块">
        <template #input>
          <van-slider v-model="formData.slider" />
        </template>
      </van-field>

      <!-- 文件上传 -->
      <van-field name="uploader" label="文件上传">
        <template #input>
          <van-uploader v-model="formData.files" />
        </template>
      </van-field>

      <!-- 选择器 -->
      <van-field
        v-model="formData.city"
        is-link
        readonly
        name="picker"
        label="选择器"
        placeholder="点击选择城市"
        @click="showPicker = true"
      />
      <van-popup v-model:show="showPicker" destroy-on-close position="bottom">
        <van-picker
          :columns="cityColumns"
          :model-value="cityPickerValue"
          @confirm="cityConfirm"
          @cancel="showPicker = false"
        />
      </van-popup>

      <!-- 时间选择 -->
      <van-field
        v-model="formData.time"
        is-link
        readonly
        name="datePicker"
        label="时间选择"
        placeholder="点击选择时间"
        @click="timePicker = true"
      />
      <van-popup v-model:show="timePicker" destroy-on-close position="bottom">
        <van-date-picker
          :model-value="timePickerValue"
          @confirm="timeConfirm"
          @cancel="timePicker = false"
        />
      </van-popup>

      <!-- 地区选择 -->
      <van-field
        v-model="formData.area"
        is-link
        readonly
        name="area"
        label="地区选择"
        placeholder="点击选择省市区"
        @click="showArea = true"
      />
      <van-popup v-model:show="showArea" destroy-on-close position="bottom">
        <van-area
          :area-list="areaList"
          :model-value="areaPickerValue"
          @confirm="areaConfirm"
          @cancel="showArea = false"
        />
      </van-popup>

      <!-- 日历 -->
      <van-field
        v-model="formData.calendar"
        is-link
        readonly
        name="calendar"
        label="日历"
        placeholder="点击选择日期"
        @click="showCalendar = true"
      />
      <van-calendar v-model:show="showCalendar" @confirm="calendarConfirm" />
    </van-cell-group>
    <div style="margin: 16px">
      <van-button round block type="primary" native-type="submit">
        提交
      </van-button>
    </div>
  </van-form>
</template>

<style scoped></style>

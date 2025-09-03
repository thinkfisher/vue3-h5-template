<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/logo_melomini.png" alt="Logo" class="logo" />
        <h2 class="title">欢迎登录</h2>
        <p class="subtitle">请输入您的账号信息</p>
      </div>

      <van-form class="login-form" @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="loginForm.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }]"
            left-icon="user-o"
          />
          <van-field
            v-model="loginForm.password"
            :type="passwordVisible ? 'text' : 'password'"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
            left-icon="lock"
          >
            <template #right-icon>
              <van-icon
                :name="passwordVisible ? 'eye-o' : 'closed-eye'"
                class="password-toggle-icon"
                @click="togglePasswordVisibility"
              />
            </template>
          </van-field>
        </van-cell-group>

        <div class="form-options">
          <van-checkbox v-model="loginForm.rememberMe">记住我</van-checkbox>
          <span class="forgot-password" @click="forgotPassword"
            >忘记密码？</span
          >
        </div>

        <div class="submit-btn">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            size="large"
          >
            {{ loading ? "登录中..." : "登录" }}
          </van-button>
        </div>
      </van-form>

      <div class="login-footer">
        <p class="register-link">
          还没有账号？<span @click="goToRegister">立即注册</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { showToast, showSuccessToast } from "vant";
import { useUserStore } from "@/store/modules/user";

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const passwordVisible = ref(false);

const loginForm = reactive({
  username: "admin",
  password: "123456",
  rememberMe: false
});

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

const onSubmit = async values => {
  try {
    loading.value = true;
    await userStore.login(values);
    showSuccessToast("登录成功");
    router.push("/");
  } catch (error) {
    showToast(error.message || "登录失败，请重试");
  } finally {
    loading.value = false;
  }
};

const forgotPassword = () => {
  showToast("请联系管理员重置密码");
};

const goToRegister = () => {
  showToast("注册功能暂未开放");
};
</script>

<style lang="less" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
  }

  .title {
    font-size: 28px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
}

.login-form {
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 0;
    padding: 0 16px;

    .forgot-password {
      color: #667eea;
      font-size: 14px;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .submit-btn {
    margin-top: 30px;
    padding: 0 16px;
  }
}

.password-toggle-icon {
  color: #999;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #667eea;
  }
}

.login-footer {
  text-align: center;
  margin-top: 30px;

  .register-link {
    font-size: 14px;
    color: #666;

    span {
      color: #667eea;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// 响应式设计
@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }

  .login-box {
    padding: 30px 20px;
  }

  .login-header {
    .title {
      font-size: 24px;
    }
  }
}
</style>

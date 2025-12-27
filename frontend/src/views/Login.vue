<template>
  <div class="auth-container">
    <div class="surface-card p-6 shadow-2 border-round login-card">
      <div class="text-center mb-5">
        <div class="inline-flex align-items-center justify-content-center bg-primary border-round mb-3" style="width: 56px; height: 56px">
          <i class="pi pi-bolt text-3xl text-white"></i>
        </div>
        <div class="text-900 text-3xl font-bold mb-3">LicitaBot</div>
        <span class="text-600 font-medium line-height-3">Acesse sua conta para continuar</span>
      </div>

      <form @submit.prevent="handleLogin" class="p-fluid">
        <div class="field mb-4">
          <label for="email" class="block text-900 font-bold mb-2">E-mail</label>
          <InputText id="email" v-model="email" type="email" placeholder="seu@email.com" class="w-full" required />
        </div>

        <div class="field mb-4">
          <label for="password" class="block text-900 font-bold mb-2">Senha</label>
          <InputText id="password" v-model="password" type="password" placeholder="********" class="w-full" required />
        </div>

        <div class="flex align-items-center justify-content-between mb-6">
          <div class="flex align-items-center">
            <Checkbox id="remember" v-model="remember" :binary="true" class="mr-2"></Checkbox>
            <label for="remember" class="text-700 cursor-pointer">Lembrar-me</label>
          </div>
          <a class="font-bold no-underline ml-2 text-primary cursor-pointer hover:underline">Esqueceu a senha?</a>
        </div>

        <Button label="Entrar" icon="pi pi-sign-in" type="submit" :loading="state.loading" class="w-full"></Button>
      </form>

      <div class="text-center mt-6">
        <span class="text-600 font-medium">Não tem uma conta?</span>
        <router-link to="/register" class="font-bold no-underline ml-2 text-primary hover:underline">Crie agora!</router-link>
      </div>

      <div v-if="state.error" class="mt-4">
        <Message severity="error" :closable="false">{{ state.error }}</Message>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const { login, state } = useAuth();
const toast = useToast();

const email = ref('');
const password = ref('');
const remember = ref(false);

const handleLogin = async () => {
  const success = await login(email.value, password.value);
  if (success) {
    toast.add({
      severity: 'success',
      summary: 'Bem-vindo!',
      detail: `O login foi realizado com sucesso.`,
      life: 3000
    });
    router.push('/');
  }
};
</script>

<style scoped>
.auth-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    width: 100%;
    background-color: var(--surface-ground);
    padding: 1.5rem;
}

.login-card {
    width: 100%;
    max-width: 400px;
    border-radius: 12px;
}
</style>

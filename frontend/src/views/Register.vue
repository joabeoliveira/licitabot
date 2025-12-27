<template>
  <div class="auth-container">
    <div class="surface-card p-6 shadow-2 border-round register-card">
      <div class="text-center mb-5">
        <div class="inline-flex align-items-center justify-content-center bg-primary border-round mb-3" style="width: 56px; height: 56px">
          <i class="pi pi-user-plus text-3xl text-white"></i>
        </div>
        <div class="text-900 text-3xl font-bold mb-3">Cadastro</div>
        <p class="text-600 font-medium line-height-3">Preencha os dados da sua empresa abaixo</p>
      </div>

      <form @submit.prevent="handleRegister" class="p-fluid">
        <div class="grid">
          <div class="col-12 field mb-3">
            <label for="name" class="block text-900 font-bold mb-2">Nome Completo</label>
            <InputText id="name" v-model="form.name" type="text" placeholder="Seu Nome" class="w-full" required />
          </div>

          <div class="col-12 field mb-3">
            <label for="email" class="block text-900 font-bold mb-2">E-mail</label>
            <InputText id="email" v-model="form.email" type="email" placeholder="seu@email.com" class="w-full" required />
          </div>

          <div class="col-12 field mb-3">
            <label for="companyName" class="block text-900 font-bold mb-2">Empresa</label>
            <InputText id="companyName" v-model="form.companyName" type="text" placeholder="Nome da Empresa" class="w-full" />
          </div>

          <div class="col-12 field mb-3">
            <label for="cnpj" class="block text-900 font-bold mb-2">CNPJ</label>
            <InputText id="cnpj" v-model="form.cnpj" type="text" placeholder="00.000.000/0000-00" class="w-full" />
          </div>

          <div class="col-12 field mb-4">
            <label for="password" class="block text-900 font-bold mb-2">Senha</label>
            <InputText id="password" v-model="form.password" type="password" placeholder="Mínimo 6 caracteres" class="w-full" required />
          </div>
        </div>

        <div class="flex align-items-center mb-6">
          <Checkbox id="terms" v-model="terms" :binary="true" class="mr-2"></Checkbox>
          <label for="terms" class="text-700 cursor-pointer">Li e aceito os <a class="text-primary font-bold hover:underline">termos de uso</a></label>
        </div>

        <Button label="Registrar" icon="pi pi-check" type="submit" :loading="state.loading" class="w-full" :disabled="!terms"></Button>
      </form>

      <div class="text-center mt-6">
        <span class="text-600 font-medium">Já tem uma conta?</span>
        <router-link to="/login" class="font-bold no-underline ml-2 text-primary hover:underline">Faça login!</router-link>
      </div>

      <div v-if="state.error" class="mt-4">
        <Message severity="error" :closable="false">{{ state.error }}</Message>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const { register, state } = useAuth();
const toast = useToast();

const terms = ref(false);
const form = reactive({
  name: '',
  email: '',
  password: '',
  companyName: '',
  cnpj: ''
});

const handleRegister = async () => {
  const success = await register({ ...form });
  if (success) {
    toast.add({
      severity: 'success',
      summary: 'Sucesso!',
      detail: `Bem-vindo ao LicitaBot, ${form.name}!`,
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
    background-color: var(--surface-ground); /* Ensure distinct background */
    padding: 1.5rem;
}

.register-card {
    width: 100%;
    max-width: 500px; /* Enforce max-width to prevent bursting */
    border-radius: 12px;
}
</style>

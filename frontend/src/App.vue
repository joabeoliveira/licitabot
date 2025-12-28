<template>
  <div class="layout-wrapper" :class="{ 'auth-page': !isAuthenticated() }">
    <!-- Sidebar Sleek Black -->
    <Drawer v-if="isAuthenticated()" v-model:visible="visible" class="layout-sidebar p-0 no-border">
      <template #header>
          <div class="flex align-items-center gap-3 px-2">
            <div class="brand-bolt shadow-3">
                <i class="pi pi-bolt text-white"></i>
            </div>
            <span class="text-2xl font-black text-white tracking-tighter">Licita<span class="text-primary">Bot</span></span>
          </div>
      </template>

      <div class="flex flex-column h-full">
        <div class="overflow-y-auto mt-4 px-3 flex-grow-1">
          <ul class="list-none p-0 m-0">
            <li v-for="item in menuItems" :key="item.label" class="mb-3">
              <router-link :to="item.to" 
                class="flex align-items-center cursor-pointer p-3 border-round-xl text-500 hover:text-white hover:bg-gray-900 transition-all no-underline font-bold" 
                :class="{ 'active-nav text-white': $route.path === item.to }">
                <i :class="[item.icon, 'mr-3 text-xl']"></i>
                <span>{{ item.label }}</span>
              </router-link>
            </li>
          </ul>
        </div>
        
        <!-- Perfil no Rodapé -->
        <div class="mt-auto p-4 bg-black border-top-1 border-gray-900">
          <div class="flex align-items-center gap-3 mb-4">
            <Avatar :label="state.user?.name?.charAt(0)" shape="circle" class="bg-primary text-white shadow-3" size="large" />
            <div class="flex flex-column overflow-hidden">
                <span class="font-black text-sm text-0 shadow-text truncate">{{ state.user?.name || 'Administrador' }}</span>
                <span class="text-xs text-600 truncate uppercase font-bold tracking-widest">{{ state.user?.email }}</span>
            </div>
          </div>
          <Button label="Encerrar Sessão" icon="pi pi-sign-out" severity="secondary" text class="w-full border-round-xl hover:bg-red-900 transition-colors" @click="handleLogout"></Button>
        </div>
      </div>
    </Drawer>

    <!-- Área Principal Black -->
    <div class="layout-main">
      <!-- Topbar Sleek -->
      <div v-if="isAuthenticated()" class="layout-topbar px-4 flex align-items-center justify-content-between h-5rem sticky top-0 z-5">
        <div class="flex align-items-center">
            <Button icon="pi pi-bars" @click="visible = true" class="mr-3" text rounded severity="secondary"></Button>
            <div class="hidden md:block">
                <Breadcrumb :model="breadcrumbItems" class="bg-transparent border-none p-0 text-xs uppercase font-black tracking-widest" />
            </div>
        </div>
        <div class="flex align-items-center gap-3">
            <div class="relative hidden lg:block h-2.5rem">
                <i class="pi pi-search absolute left-0 ml-3 top-50 z-2 text-600" style="transform: translateY(-50%)"></i>
                <InputText placeholder="Comando rápido..." class="border-round-2xl w-20rem h-full search-bar pl-6" />
            </div>
            <Button icon="pi pi-bell" rounded text severity="secondary" v-badge="2" class="h-2.5rem w-2.5rem"></Button>
            <Avatar icon="pi pi-user" shape="circle" class="cursor-pointer hover:border-primary border-2 border-transparent transition-all" />
        </div>
      </div>

      <!-- Conteúdo com Margem de Segurança -->
      <div class="layout-content">
        <router-view></router-view>
      </div>
    </div>
    
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from './store/auth';
import Drawer from 'primevue/drawer';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Breadcrumb from 'primevue/breadcrumb';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';

const { state, isAuthenticated, logout } = useAuth();
const router = useRouter();
const visible = ref(false);
const route = useRoute();

const menuItems = [
  { label: 'Dashboard', icon: 'pi pi-compass', to: '/' },
  { label: 'Radar de Editais', icon: 'pi pi-bolt', to: '/radar' },
  { label: 'Precificação IA', icon: 'pi pi-money-bill', to: '/precificacao' },
  { label: 'Compliance Lab', icon: 'pi pi-shield', to: '/conformidade' },
  { label: 'Automação', icon: 'pi pi-cog', to: '/automacao' }
];

const handleLogout = () => {
    logout();
    router.push('/login');
};

const breadcrumbItems = computed(() => {
    const items = [{ label: 'Terminal', to: '/' }];
    if (route.path !== '/' && route.path !== '/login' && route.path !== '/register') {
        const current = menuItems.find(i => i.to === route.path);
        if (current) items.push({ label: current.label });
    }
    return items;
});
</script>

<style>
/* Estilos Específicos do Layout Sleek Black */
.layout-sidebar {
    background-color: #0a0a0c !important;
    width: 300px !important;
}

.brand-bolt {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.active-nav {
    background: rgba(59, 130, 246, 0.1) !important;
    border-left: 4px solid var(--primary-color);
}

.search-bar {
    background: #141417 !important;
    border: 1px solid #26262b !important;
    color: white !important;
}

.layout-topbar {
    background: rgba(10, 10, 12, 0.8);
    backdrop-filter: blur(12px);
}

.shadow-text {
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

/* Scrollbar Dark Custom */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #0a0a0c;
}
::-webkit-scrollbar-thumb {
  background: #26262b;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #3b82f6;
}
</style>

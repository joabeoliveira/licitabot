<template>
  <div class="h-full flex flex-column animate-in">
    <!-- Cabeçalho -->
    <div class="p-4 md:p-6 pb-0">
        <div class="lb-page-header flex justify-content-between align-items-center">
            <div>
                <h1 class="lb-page-title">Fábrica de <span class="text-primary">Robôs</span></h1>
                <p class="lb-page-subtitle">Crie e gerencie fluxos de automação personalizados.</p>
            </div>
            <div class="flex gap-2">
                <Button label="Abrir Editor Cheio" icon="pi pi-external-link" severity="secondary" @click="openN8nFull" text />
                <Button label="Salvar Fluxos" icon="pi pi-save" class="shadow-4" />
            </div>
        </div>
    </div>

    <!-- IFrame do n8n -->
    <div class="flex-grow-1 p-4 md:p-6 pt-2">
        <div class="lb-card p-0 overflow-hidden h-full border-2 border-gray-900 shadow-8 relative" style="min-height: 600px; background: #000">
            <!-- Overlay de Carregamento -->
            <div v-if="loading" class="absolute top-0 left-0 w-full h-full bg-black z-5 flex flex-column align-items-center justify-content-center">
                <i class="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
                <span class="text-500 font-bold uppercase tracking-widest text-xs">Conectando ao Motor n8n...</span>
            </div>
            
            <iframe 
                :src="n8nUrl" 
                class="w-full h-full border-none" 
                @load="loading = false"
                allow="clipboard-read; clipboard-write"
            ></iframe>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';

const loading = ref(true);
// Em produção, isso viria de uma variável de ambiente ou config do backend
const n8nUrl = ref('http://localhost:5678');

const openN8nFull = () => {
    window.open(n8nUrl.value, '_blank');
};
</script>

<style scoped>
/* Estilos para "limpar" a integração do IFrame */
iframe {
    filter: contrast(1.1) brightness(0.9);
    background: #0a0a0c;
}

.shadow-8 {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
</style>

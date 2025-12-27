<template>
  <div class="p-4 md:p-6 animate-in">
    <!-- Cabeçalho Padronizado Dark -->
    <div class="lb-page-header">
        <h1 class="lb-page-title">Precificação <span class="text-primary">Inteligente</span></h1>
        <p class="lb-page-subtitle">Big Data aplicado ao histórico de compras públicas nacionais.</p>
    </div>

    <!-- Filtros de Busca -->
    <div class="lb-card mb-4 border-2">
      <!-- Linha Principal de Filtros -->
      <div class="grid align-items-start">
        <div class="col-12 md:col-6 lg:col-3">
            <div class="flex flex-column h-full">
                <label class="block font-bold mb-2 text-xs text-500 uppercase tracking-widest">1. Modo de Busca</label>
                <SelectButton v-model="searchMode" :options="modes" optionLabel="label" optionValue="value" class="w-full h-3rem" />
            </div>
        </div>
        <div class="col-12 lg:col-6">
            <div class="flex flex-column h-full">
                <label class="block font-bold mb-2 text-xs text-500 uppercase tracking-widest">2. Termo ou Código</label>
                <div class="relative w-full h-3rem">
                    <i class="pi pi-search absolute left-0 ml-4 top-50 z-2 text-500" style="transform: translateY(-50%)"></i>
                    <InputText v-model="searchQuery" :placeholder="searchPlaceholder" 
                    class="w-full h-full pl-6 no-border border-round-xl shadow-inner bg-black-transparent" 
                    @keyup.enter="analyzePrice" 
                    />
                </div>
            </div>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
            <div class="flex flex-column h-full">
                <label class="block font-bold mb-2 text-xs text-500 uppercase tracking-widest">3. Estado (UF)</label>
                <Dropdown v-model="selectedUf" :options="ufs" optionLabel="label" optionValue="value" placeholder="Todo o Brasil" class="w-full h-3rem no-border" />
            </div>
        </div>
      </div>

      <!-- Linha do Botão de Ação -->
      <div class="flex justify-content-end mt-4 pt-3 border-top-1" style="border-color: #26262b">
          <Button 
              label="Analisar Mercado Agora" 
              icon="pi pi-chart-bar" 
              :loading="loading" 
              @click="analyzePrice" 
              class="h-3.5rem px-6 font-black shadow-6 border-round-xl w-full md:w-auto p-button-lg"
          />
      </div>
    </div>

    <!-- Área de Resultados -->
    <div v-if="hasResults">
        <!-- Filtro de Unidade -->
        <div v-if="availableUnits.length > 1" class="flex align-items-center gap-3 mb-5 p-3 surface-card border-round-xl border-1 border-gray-800 shadow-2">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-filter-fill text-primary"></i>
            <span class="text-300 font-bold">Unidade de Medida:</span>
          </div>
          <Dropdown v-model="selectedUnit" :options="availableUnits" placeholder="Todas" class="w-10rem h-2.5rem" showClear />
          <span class="text-500 text-sm ml-auto font-medium">Mostrando {{ displayStats.count }} registros</span>
        </div>

        <!-- Estatísticas Principais -->
        <div class="grid mb-5">
          <div class="col-12 md:col-4">
            <div class="lb-card text-center h-full flex flex-column justify-content-center border-none" style="background: linear-gradient(135deg, #141417 0%, #1a1a20 100%)">
              <span class="block text-500 font-bold text-xs uppercase mb-3 tracking-widest">Preço Mínimo</span>
              <div class="text-green-500 font-black text-4xl mb-1">{{ formatCurrency(displayStats.min) }}</div>
              <span class="text-green-900 font-bold text-xs uppercase bg-green-900-transparent px-2 py-1 border-round mx-auto">Piso Detectado</span>
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="lb-card text-center h-full flex flex-column justify-content-center border-primary shadow-6" style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)">
              <span class="block text-blue-100 font-bold text-xs uppercase mb-3 tracking-widest">Preço Médio</span>
              <div class="text-white font-black text-5xl mb-1">{{ formatCurrency(displayStats.avg) }}</div>
              <span class="text-blue-100 font-medium text-xs">Valor ideal para lances</span>
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="lb-card text-center h-full flex flex-column justify-content-center border-none" style="background: linear-gradient(135deg, #141417 0%, #1a1a20 100%)">
              <span class="block text-500 font-bold text-xs uppercase mb-3 tracking-widest">Preço Máximo</span>
              <div class="text-red-400 font-black text-4xl mb-1">{{ formatCurrency(displayStats.max) }}</div>
              <span class="text-red-900 font-bold text-xs uppercase bg-red-900-transparent px-2 py-1 border-round mx-auto">Teto Crítico</span>
            </div>
          </div>
        </div>

        <!-- Tabela -->
        <div class="lb-card p-0 overflow-hidden border-none shadow-6">
          <div class="p-4 flex align-items-center gap-3 border-bottom-1" style="border-color: #26262b">
            <i class="pi pi-list text-primary text-xl"></i>
            <h3 class="m-0 text-900 font-bold tracking-tight">Histórico Analítico</h3>
          </div>
          <DataTable :value="filteredHistory" :rows="8" paginator class="p-datatable-sm" responsiveLayout="scroll">
            <Column field="description" header="Objeto Descrito" style="min-width: 40%">
                <template #body="slotProps">
                    <div class="font-bold text-gray-100 line-height-3">{{ slotProps.data.description }}</div>
                    <div class="text-xs text-500 mt-1 uppercase font-semibold">UF: {{ slotProps.data.uf || 'Brasil' }}</div>
                </template>
            </Column>
            <Column field="date" header="Publicação" style="width: 140px">
              <template #body="slotProps">
                <span class="text-500 font-medium"><i class="pi pi-calendar mr-2"></i>{{ formatDate(slotProps.data.date) }}</span>
              </template>
            </Column>
            <Column field="organ" header="Órgão Comprador" style="min-width: 25%"></Column>
            <Column field="unitPrice" header="Vlr. Unitário" style="width: 15rem">
              <template #body="slotProps">
                <div class="flex flex-column text-right md:text-left">
                  <span class="font-black text-primary-400 text-2xl tracking-tighter">{{ formatCurrency(slotProps.data.unitPrice) }}</span>
                  <span class="text-500 text-xs font-bold">{{ slotProps.data.unit }}</span>
                </div>
              </template>
            </Column>
            <Column header="" style="width: 4rem" class="text-center">
              <template #body="slotProps">
                <Button v-if="slotProps.data.link && slotProps.data.link !== '#'" 
                        icon="pi pi-external-link" 
                        text rounded severity="primary"
                        @click="window.open(slotProps.data.link, '_blank')" />
              </template>
            </Column>
          </DataTable>
        </div>
    </div>

    <!-- Estado Inicial -->
    <div v-else-if="!loading" class="flex flex-column align-items-center justify-content-center py-8 text-center">
        <div class="hero-bg mb-5 animate-pulse">
          <i class="pi pi-chart-line text-7xl text-primary"></i>
        </div>
        <h2 class="text-900 font-extrabold text-4xl mb-3 tracking-tighter">Pronto para a análise?</h2>
        <p class="text-500 max-w-30rem mx-auto text-xl mb-6">Busque por termos gerais ou especificações técnicas para obter as médias de lances vencedores.</p>
        <div class="flex gap-4">
          <Tag value="PNCP" class="px-3 py-2 font-bold shadow-2"></Tag>
          <Tag value="Dados Públicos" severity="secondary" class="px-3 py-2 font-bold shadow-2"></Tag>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { formatCurrency, formatDate } from '../utils/formatters';

const toast = useToast();

const searchQuery = ref('');
const searchMode = ref('text');
const selectedUf = ref('');
const selectedUnit = ref(null);
const loading = ref(false);
const hasResults = ref(false);
const rawHistory = ref([]);

const modes = [
    { label: 'Geral', value: 'text' },
    { label: 'CATMAT', value: 'catmat' },
    { label: 'CATSER', value: 'catser' }
];

const ufs = [
    { label: 'Brasil (Todo)', value: '' },
    { label: 'AC', value: 'AC' }, { label: 'AL', value: 'AL' }, { label: 'AP', value: 'AP' }, 
    { label: 'AM', value: 'AM' }, { label: 'BA', value: 'BA' }, { label: 'CE', value: 'CE' }, 
    { label: 'DF', value: 'DF' }, { label: 'ES', value: 'ES' }, { label: 'GO', value: 'GO' }, 
    { label: 'MA', value: 'MA' }, { label: 'MT', value: 'MT' }, { label: 'MS', value: 'MS' }, 
    { label: 'MG', value: 'MG' }, { label: 'PA', value: 'PA' }, { label: 'PB', value: 'PB' }, 
    { label: 'PR', value: 'PR' }, { label: 'PE', value: 'PE' }, { label: 'PI', value: 'PI' }, 
    { label: 'RJ', value: 'RJ' }, { label: 'RN', value: 'RN' }, { label: 'RS', value: 'RS' }, 
    { label: 'RO', value: 'RO' }, { label: 'RR', value: 'RR' }, { label: 'SC', value: 'SC' }, 
    { label: 'SP', value: 'SP' }, { label: 'SE', value: 'SE' }, { label: 'TO', value: 'TO' }
];

const searchPlaceholder = computed(() => {
    if (searchMode.value === 'catmat') return 'Código CATMAT...';
    if (searchMode.value === 'catser') return 'Código CATSER...';
    return 'Ex: Caneta esferográfica...';
});

const filteredHistory = computed(() => {
    if (!selectedUnit.value) return rawHistory.value;
    return rawHistory.value.filter(item => item.unit === selectedUnit.value);
});

const availableUnits = computed(() => {
    const units = rawHistory.value
        .map(item => item.unit)
        .filter((unit, index, self) => unit && self.indexOf(unit) === index);
    return units.sort();
});

const displayStats = computed(() => {
    const items = filteredHistory.value;
    if (items.length === 0) return { min: 0, max: 0, avg: 0, count: 0 };
    const prices = items.map(i => i.unitPrice);
    return {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((a, b) => a + b, 0) / prices.length,
        count: items.length
    };
});

const analyzePrice = async () => {
    if (!searchQuery.value) return;
    loading.value = true;
    hasResults.value = false;
    selectedUnit.value = null;
    try {
        const response = await axios.get('http://localhost:5000/api/prices/analyze', {
            params: { q: searchQuery.value, mode: searchMode.value, uf: selectedUf.value }
        });
        const data = response.data.data;
        if (!data.history || data.history.length === 0) {
            toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Nhum dado histórico encontrado.', life: 3000 });
            return;
        }
        rawHistory.value = data.history;
        hasResults.value = true;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao buscar dados históricos.', life: 3000 });
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.hero-bg {
    width: 140px;
    height: 140px;
    background: rgba(59, 130, 246, 0.05);
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(59, 130, 246, 0.1);
}

.animate-pulse {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(1); opacity: 0.8; }
}

.bg-green-900-transparent { background: rgba(34, 197, 94, 0.1); }
.bg-red-900-transparent { background: rgba(239, 68, 68, 0.1); }
.bg-black-transparent { background: #000000 !important; }
</style>

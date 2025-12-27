<template>
  <div class="p-4 md:p-6 animate-in">
    <!-- Cabeçalho Padronizado Dark -->
    <div class="lb-page-header">
        <h1 class="lb-page-title">Dashboard</h1>
        <p class="lb-page-subtitle">Visão geral da sua inteligência competitiva.</p>
    </div>

    <!-- Cards de Métricas -->
    <div class="grid mb-5">
      <div class="col-12 md:col-6 lg:col-3">
        <div class="lb-card h-full border-none shadow-4" style="background: linear-gradient(135deg, #141417 0%, #1e1e24 100%)">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-bold text-xs uppercase mb-2 tracking-widest">Editais Ativos</span>
              <div class="text-900 font-black text-3xl">124</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-blue-900 border-round-xl w-3.5rem h-3.5rem shadow-2">
              <i class="pi pi-search text-blue-400 text-2xl"></i>
            </div>
          </div>
          <div class="flex align-items-center gap-2">
            <span class="text-green-500 font-bold text-sm bg-green-900-transparent px-2 py-1 border-round">+12.4%</span>
            <span class="text-500 text-xs font-semibold uppercase">vs ontem</span>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="lb-card h-full border-none shadow-4" style="background: linear-gradient(135deg, #141417 0%, #1e1e24 100%)">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-bold text-xs uppercase mb-2 tracking-widest">Taxa de Sucesso</span>
              <div class="text-900 font-black text-3xl">24.5%</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-orange-900 border-round-xl w-3.5rem h-3.5rem shadow-2">
              <i class="pi pi-chart-line text-orange-400 text-2xl"></i>
            </div>
          </div>
          <div class="flex align-items-center gap-2">
            <span class="text-green-500 font-bold text-sm bg-green-900-transparent px-2 py-1 border-round">+2.1%</span>
            <span class="text-500 text-xs font-semibold uppercase">este mês</span>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="lb-card h-full border-none shadow-4" style="background: linear-gradient(135deg, #141417 0%, #1e1e24 100%)">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-bold text-xs uppercase mb-2 tracking-widest">Conformidade</span>
              <div class="text-900 font-black text-3xl">18/20</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-cyan-900 border-round-xl w-3.5rem h-3.5rem shadow-2">
              <i class="pi pi-file-check text-cyan-400 text-2xl"></i>
            </div>
          </div>
          <div class="flex align-items-center gap-2">
            <span class="text-red-400 font-bold text-sm bg-red-900-transparent px-2 py-1 border-round">-2 pendentes</span>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="lb-card h-full border-none shadow-4" style="background: linear-gradient(135deg, #141417 0%, #1e1e24 100%)">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-bold text-xs uppercase mb-2 tracking-widest">IA Insight</span>
              <div class="text-900 font-black text-3xl">42</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-purple-900 border-round-xl w-3.5rem h-3.5rem shadow-2">
              <i class="pi pi-sparkles text-purple-400 text-2xl"></i>
            </div>
          </div>
          <div class="flex align-items-center gap-2">
            <span class="text-purple-300 font-bold text-sm uppercase">Lances Otimizados</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Seção de Tabelas e Atividades -->
    <div class="grid">
      <div class="col-12 lg:col-8">
        <div class="lb-card p-0 overflow-hidden shadow-6 border-none">
          <div class="p-4 flex align-items-center justify-content-between" style="border-bottom: 1px solid #26262b">
            <div class="flex align-items-center gap-2">
                <i class="pi pi-bolt text-primary font-bold"></i>
                <h3 class="m-0 text-900 font-extrabold tracking-tight">Oportunidades em Foco</h3>
            </div>
            <Button icon="pi pi-chevron-right" text rounded @click="$router.push('/radar')"></Button>
          </div>
          <DataTable :value="recentTenders" :loading="loading" class="p-datatable-sm">
            <template #empty>Não há editais salvos ainda.</template>
            <Column field="title" header="Objeto Licitatório" style="min-width: 40%">
                <template #body="slotProps">
                    <span class="font-bold text-gray-200">{{ slotProps.data.title }}</span>
                </template>
            </Column>
            <Column field="openingDate" header="Abertura">
              <template #body="slotProps">
                  <span class="text-500 font-medium">{{ formatDate(slotProps.data.openingDate) }}</span>
              </template>
            </Column>
            <Column field="estimatedValue" header="Estimativa">
              <template #body="slotProps">
                  <span class="text-green-500 font-bold">{{ formatCurrency(slotProps.data.estimatedValue) }}</span>
              </template>
            </Column>
            <Column field="status" header="Status">
              <template #body="slotProps">
                <Tag :severity="getSeverity(slotProps.data.status)" :value="slotProps.data.status" rounded class="font-bold"></Tag>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <!-- Alertas Rápidos -->
      <div class="col-12 lg:col-4">
          <div class="lb-card h-full border-none shadow-6">
              <div class="flex align-items-center gap-2 mb-4 pb-2" style="border-bottom: 1px solid #26262b">
                  <i class="pi pi-bell text-yellow-500 font-bold"></i>
                  <h3 class="m-0 text-900 font-extrabold tracking-tight">Alertas Críticos</h3>
              </div>
              <ul class="list-none p-0 m-0">
                  <li class="flex align-items-center py-3 border-bottom-1" style="border-color: #26262b">
                      <div class="w-2.5rem h-2.5rem flex align-items-center justify-content-center bg-red-900 border-circle mr-3">
                          <i class="pi pi-file-excel text-red-400"></i>
                      </div>
                      <div class="flex flex-column">
                          <span class="text-900 font-bold text-sm">CND Estadual (SP)</span>
                          <span class="text-500 text-xs font-medium">Vencimento em 24h</span>
                      </div>
                  </li>
                  <li class="flex align-items-center py-3">
                      <div class="w-2.5rem h-2.5rem flex align-items-center justify-content-center bg-orange-900 border-circle mr-3">
                          <i class="pi pi-clock text-orange-400"></i>
                      </div>
                      <div class="flex flex-column">
                          <span class="text-900 font-bold text-sm">Atualização SICAF</span>
                          <span class="text-500 text-xs font-medium">Documento pendente de upload</span>
                      </div>
                  </li>
              </ul>
              <Button label="Resolver Agora" icon="pi pi-check-circle" class="w-full mt-5 font-bold p-button-lg shadow-4 border-round-xl" @click="$router.push('/conformidade')"></Button>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import { formatCurrency, formatDate } from '../utils/formatters';

const recentTenders = ref([]);
const loading = ref(false);

const fetchSavedTenders = async () => {
    loading.value = true;
    try {
        const response = await axios.get('http://localhost:5000/api/tenders/saved');
        recentTenders.value = response.data.data.slice(0, 5);
    } catch (error) {
        console.error('Erro ao buscar editais salvos:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => fetchSavedTenders());

const getSeverity = (status) => {
    switch (status) {
        case 'Aberto': return 'success';
        case 'Análise': return 'warning';
        case 'Futuro': return 'info';
        default: return 'secondary';
    }
};
</script>

<style scoped>
.bg-green-900-transparent { background: rgba(34, 197, 94, 0.1); }
.bg-red-900-transparent { background: rgba(239, 68, 68, 0.1); }
</style>

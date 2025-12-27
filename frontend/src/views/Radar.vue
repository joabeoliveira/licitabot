<template>
  <div class="p-4 md:p-6 animate-in">
    <!-- Cabeçalho -->
    <div class="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-6 gap-3">
        <div class="lb-page-header mb-0">
            <h1 class="lb-page-title">Radar de <span class="text-primary">Editais</span></h1>
            <p class="lb-page-subtitle">Varredura profunda em bancos de dados governamentais.</p>
        </div>
        <Button label="Sincronizar Fontes" icon="pi pi-sync" :loading="loading" @click="fetchTenders(1)" class="shadow-6 border-round-xl p-button-lg"></Button>
    </div>

    <!-- Filtros Dark -->
    <div class="lb-card mb-5 border-2 shadow-8" style="background: rgba(20, 20, 23, 0.9)">
      <div class="grid align-items-end">
        <div class="col-12 md:col-5">
            <div class="flex flex-column h-full">
                <label class="block font-bold mb-2 text-xs text-500 uppercase tracking-widest">Palavras-Chave</label>
                <div class="relative w-full h-3rem">
                    <i class="pi pi-search absolute left-0 ml-3 top-50 z-2 text-500" style="transform: translateY(-50%)"></i>
                    <InputText v-model="search" placeholder="Ex: Equipamentos Médicos, Consultoria..." 
                        class="w-full h-full pl-6 no-border border-round-xl shadow-inner bg-black-transparent h-3rem" 
                        @keyup.enter="fetchTenders(1)" />
                </div>
            </div>
        </div>
        <div class="col-12 md:col-4">
            <div class="flex flex-column h-full">
                <label class="block font-bold mb-2 text-xs text-500 uppercase tracking-widest">Geolocalização</label>
                <Dropdown v-model="selectedRegion" :options="regions" optionLabel="label" optionValue="value" 
                    placeholder="Brasil (Todo)" class="w-full h-3rem border-none bg-black-transparent" showClear />
            </div>
        </div>
        <div class="col-12 md:col-3">
            <div class="flex gap-2">
                <Button label="Filtrar" icon="pi pi-filter" class="flex-1 h-3rem font-black" @click="fetchTenders(1)"></Button>
                <Button icon="pi pi-bookmark" outlined severity="secondary" class="h-3rem border-gray-800" v-tooltip.top="'Salvar Busca'"></Button>
            </div>
        </div>
      </div>
    </div>

    <!-- Tabela Principal -->
    <div class="lb-card p-0 overflow-hidden shadow-8 border-none" style="background: #141417">
      <DataTable :value="tenders" :loading="loading" paginator :rows="10" 
                 :lazy="true" :totalRecords="totalRecords" v-model:first="first" @page="onPage($event)"
                 class="p-datatable-sm" responsiveLayout="scroll">
        <template #empty v-if="!loading">
            <div class="flex flex-column align-items-center p-8">
                <div class="bg-gray-900 border-circle w-6rem h-6rem flex align-items-center justify-content-center mb-4">
                    <i class="pi pi-search-minus text-4xl text-500"></i>
                </div>
                <span class="text-2xl font-black text-300">Nenhum edital encontrado</span>
                <p class="text-600 mt-2 font-medium">Refine seus termos de busca ou mude a região.</p>
            </div>
        </template>
        
        <Column field="title" header="Título da Proposta" style="min-width: 35%">
            <template #body="slotProps">
                <div class="font-black text-gray-100 line-height-3 hover:text-primary cursor-pointer transition-colors text-lg" @click="viewDetail(slotProps.data)">
                    {{ slotProps.data.title }}
                </div>
                <div class="text-xs text-500 mt-1 uppercase font-black tracking-widest flex align-items-center gap-2">
                    <span class="bg-gray-900 px-2 py-0.5 border-round">CODE: {{ slotProps.data.externalId }}</span>
                </div>
            </template>
        </Column>
        <Column field="organ" header="Unidade Compradora">
            <template #body="slotProps">
                <span class="text-sm font-bold text-gray-400">{{ slotProps.data.organ }}</span>
            </template>
        </Column>
        <Column field="estimatedValue" header="Valor Global" class="w-2">
            <template #body="slotProps">
                <div class="font-black text-xl text-green-400 tracking-tight">
                    {{ formatCurrency(slotProps.data.estimatedValue) }}
                </div>
                <div class="text-xs text-500 font-bold uppercase">{{ slotProps.data.region }}</div>
            </template>
        </Column>
        <Column header="Ações" class="w-10rem text-center">
            <template #body="slotProps">
                <div class="flex gap-1 justify-content-center">
                    <Button icon="pi pi-eye" text rounded severity="secondary" @click="viewDetail(slotProps.data)"></Button>
                    <Button :icon="slotProps.data.saved ? 'pi pi-star-fill' : 'pi pi-star'" text rounded :severity="slotProps.data.saved ? 'warning' : 'secondary'" @click="saveTender(slotProps.data)"></Button>
                    <Button icon="pi pi-external-link" text rounded severity="primary" @click="openExternal(slotProps.data)"></Button>
                </div>
            </template>
        </Column>
      </DataTable>
    </div>

    <!-- Modal Detalhado Dark -->
    <Dialog v-model:visible="displayDetail" modal dismissableMask :showHeader="false" :style="{ width: '55vw' }" :breakpoints="{ '960px': '85vw', '641px': '100vw' }" contentClass="p-0 border-round-2xl overflow-hidden">
        <div v-if="selectedTender" class="dark-modal-content animate-in">
            <div class="p-5 flex justify-content-between align-items-start" style="background: #1c1c21">
                <div>
                    <h2 class="text-3xl font-black text-white m-0 mb-2 tracking-tighter">Visão Detalhada</h2>
                    <Tag :severity="selectedTender.saved ? 'warning' : 'info'" :value="selectedTender.saved ? 'Favorito' : 'Disponível'" class="font-bold"></Tag>
                </div>
                <Button icon="pi pi-times" rounded severity="secondary" text @click="displayDetail = false"></Button>
            </div>

            <div class="p-5" style="background: #0a0a0c">
                <div class="grid">
                    <div class="col-12 mb-5">
                        <label class="block text-xs font-black text-500 uppercase mb-3 tracking-widest">Objeto Completo</label>
                        <div class="bg-gray-900 p-5 border-round-2xl text-gray-300 line-height-4 text-xl border-1 border-gray-800 shadow-inner">
                            {{ selectedTender.description }}
                        </div>
                    </div>
                    <div class="col-12 md:col-6 mb-4">
                        <label class="block text-xs font-black text-500 uppercase mb-2 tracking-widest">Comprador</label>
                        <div class="text-white font-black text-xl">{{ selectedTender.organ }}</div>
                        <div class="text-500 text-sm mt-2 flex align-items-center gap-2 font-bold uppercase">
                            <i class="pi pi-map-marker text-primary"></i> Local: {{ selectedTender.region }}
                        </div>
                    </div>
                    <div class="col-12 md:col-6 mb-4">
                        <label class="block text-xs font-black text-500 uppercase mb-2 tracking-widest">Estimativa</label>
                        <div class="text-green-500 font-black text-4xl">{{ formatCurrency(selectedTender.estimatedValue) }}</div>
                        <div class="text-500 text-sm mt-2 flex align-items-center gap-2 font-bold uppercase">
                            <i class="pi pi-calendar-clock text-primary"></i> Abertura: {{ formatDate(selectedTender.openingDate) }}
                        </div>
                    </div>
                </div>

                <div class="flex gap-4 mt-6">
                    <Button label="Adicionar aos Favoritos" :icon="selectedTender.saved ? 'pi pi-star-fill' : 'pi pi-star'" class="flex-1 font-black h-4rem shadow-8 border-round-2xl" :severity="selectedTender.saved ? 'warning' : 'primary'" @click="saveTender(selectedTender)"></Button>
                    <Button label="Ver edital no Portal" icon="pi pi-external-link" text class="flex-1 font-black h-4rem" @click="openExternal(selectedTender)"></Button>
                </div>
            </div>
        </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { formatCurrency, formatDate } from '../utils/formatters';

const toast = useToast();
const tenders = ref([]);
const loading = ref(false);
const totalRecords = ref(0);
const first = ref(0);
const search = ref('');
const selectedRegion = ref(null);

const regions = ref([
    { label: 'Acre', value: 'AC' }, { label: 'Alagoas', value: 'AL' }, { label: 'Amapá', value: 'AP' },
    { label: 'Amazonas', value: 'AM' }, { label: 'Bahia', value: 'BA' }, { label: 'Ceará', value: 'CE' },
    { label: 'Distrito Federal', value: 'DF' }, { label: 'Espírito Santo', value: 'ES' }, { label: 'Goiás', value: 'GO' },
    { label: 'Maranhão', value: 'MA' }, { label: 'Mato Grosso', value: 'MT' }, { label: 'Mato Grosso do Sul', value: 'MS' },
    { label: 'Minas Gerais', value: 'MG' }, { label: 'Pará', value: 'PA' }, { label: 'Paraíba', value: 'PB' },
    { label: 'Paraná', value: 'PR' }, { label: 'Pernambuco', value: 'PE' }, { label: 'Piauí', value: 'PI' },
    { label: 'Rio de Janeiro', value: 'RJ' }, { label: 'Rio Grande do Norte', value: 'RN' }, { label: 'Rio Grande do Sul', value: 'RS' },
    { label: 'Rondônia', value: 'RO' }, { label: 'Roraima', value: 'RR' }, { label: 'Santa Catarina', value: 'SC' },
    { label: 'São Paulo', value: 'SP' }, { label: 'Sergipe', value: 'SE' }, { label: 'Tocantins', value: 'TO' }
]);

const displayDetail = ref(false);
const selectedTender = ref(null);

const fetchTenders = async (page = 1) => {
    loading.value = true;
    try {
        const params = { page, size: 10 };
        if (search.value) params.q = search.value;
        if (selectedRegion.value) params.ufs = selectedRegion.value;
        if (page === 1) first.value = 0;

        const response = await axios.get(`http://localhost:5000/api/tenders/external`, { params });
        tenders.value = response.data.data;
        totalRecords.value = response.data.total;
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    first.value = event.first;
    fetchTenders(event.page + 1);
};

const saveTender = async (tender) => {
    try {
        await axios.post('http://localhost:5000/api/tenders', tender);
        tender.saved = true;
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Guardado nos seus favoritos.', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar.', life: 3000 });
    }
};

const viewDetail = (tender) => {
    selectedTender.value = tender;
    displayDetail.value = true;
};

const openExternal = (tender) => {
    if (tender.externalLink) window.open(tender.externalLink, '_blank');
};

onMounted(() => fetchTenders());
</script>

<style scoped>
.bg-black-transparent { background: #000000 !important; }
.shadow-8 { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3); }
</style>

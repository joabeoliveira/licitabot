<template>
  <div class="p-4 md:p-6 animate-in">
    <!-- Cabeçalho -->
    <div class="lb-page-header flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-3">
        <div>
            <h1 class="lb-page-title">Compliance <span class="text-primary">Lab</span></h1>
            <p class="lb-page-subtitle">Gestão automatizada de certidões e riscos regulatórios.</p>
        </div>
        <Button label="Registrar Documento" icon="pi pi-plus" @click="showModal = true" class="shadow-4 border-round-xl font-bold"></Button>
    </div>

    <!-- Lista de Certidões -->
    <div class="lb-card p-0 overflow-hidden shadow-6 border-none" style="background: #141417">
      <div class="p-4 flex align-items-center gap-2 border-bottom-1" style="border-color: #26262b">
          <i class="pi pi-shield text-primary"></i>
          <h3 class="m-0 text-900 font-bold uppercase tracking-widest text-sm">Dossiê de Qualificação</h3>
          <div class="ml-auto">
             <Button icon="pi pi-refresh" text rounded severity="secondary" @click="fetchCertificates" :loading="loading"></Button>
          </div>
      </div>
      
      <div v-if="certs.length === 0 && !loading" class="p-8 text-center">
          <i class="pi pi-file-excel text-5xl text-500 mb-4"></i>
          <p class="text-700 font-bold text-xl">Nenhuma certidão cadastrada.</p>
          <p class="text-500">Comece adicionando seus documentos para monitoramento automático.</p>
      </div>

      <div v-else class="flex flex-column">
        <div v-for="(cert, index) in certs" :key="cert._id" 
             class="p-4 flex flex-column md:flex-row align-items-start md:align-items-center justify-content-between hover:bg-gray-900 transition-all gap-4"
             :class="{ 'border-bottom-1': index !== certs.length - 1 }"
             style="border-color: #26262b">
            <div class="flex align-items-center gap-4">
                <div class="w-3.5rem h-3.5rem flex align-items-center justify-content-center border-round-xl shadow-4" :class="getStatusStyles(cert.status).bg">
                    <i :class="[getStatusStyles(cert.status).icon, 'text-2xl', getStatusStyles(cert.status).color]"></i>
                </div>
                <div class="flex flex-column">
                    <span class="font-black text-gray-100 text-xl tracking-tight">{{ cert.type }}</span>
                    <span class="text-500 text-xs font-bold uppercase tracking-widest mt-1 flex align-items-center gap-2">
                        <i class="pi pi-calendar"></i> expira em: <span class="text-gray-300">{{ formatDate(cert.expiryDate) }}</span>
                    </span>
                </div>
            </div>
            <div class="flex align-items-center gap-3 w-full md:w-auto justify-content-between md:justify-end">
                <Tag :severity="getStatusStyles(cert.status).severity" :value="cert.status" class="px-3 py-2 font-black shadow-2"></Tag>
                <div class="flex gap-2">
                    <Button icon="pi pi-sync" text rounded severity="secondary" v-tooltip.top="'Validar Agora'" @click="validateCert(cert._id)" :loading="validatingId === cert._id"></Button>
                    <Button icon="pi pi-trash" text rounded severity="danger" v-tooltip.top="'Remover'" @click="deleteCert(cert._id)"></Button>
                </div>
            </div>
        </div>
      </div>
      <div class="p-4 text-center border-top-1" style="border-color: #26262b; background: #0d0d0f">
          <p class="text-500 text-xs font-medium m-0 uppercase tracking-widest">Monitoramento 24/7 Ativado pela Inteligência LicitaBot</p>
      </div>
    </div>

    <!-- Modal Adicionar Certidão -->
    <Dialog v-model:visible="showModal" modal header="Novo Documento" :style="{ width: '400px' }" class="p-fluid dark-modal">
        <div class="field mb-4">
            <label class="font-bold text-500 uppercase text-xs">Tipo de Certidão</label>
            <InputText v-model="newCert.type" placeholder="Ex: CND Federal, FGTS..." class="bg-black-transparent border-none mt-2 h-3rem" />
        </div>
        <div class="field mb-4">
            <label class="font-bold text-500 uppercase text-xs">Data de Vencimento</label>
            <Calendar v-model="newCert.expiryDate" dateFormat="dd/mm/yy" class="bg-black-transparent border-none mt-2 h-3rem" showIcon />
        </div>
        <div class="flex align-items-center gap-2 mb-4">
            <Checkbox v-model="newCert.autoRenewal" :binary="true" inputId="autoRenewal" />
            <label for="autoRenewal" class="text-sm text-500">Ativar busca automática de renovação</label>
        </div>
        <template #footer>
            <Button label="Cancelar" text severity="secondary" @click="showModal = false" />
            <Button label="Salvar" icon="pi pi-check" @click="saveCertificate" :loading="saving" />
        </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Checkbox from 'primevue/checkbox';
import { useToast } from 'primevue/usetoast';
import { formatDate } from '../utils/formatters';

const toast = useToast();
const certs = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const validatingId = ref(null);

const newCert = ref({
    type: '',
    expiryDate: null,
    autoRenewal: false
});

const fetchCertificates = async () => {
    loading.value = true;
    try {
        const response = await axios.get('http://localhost:5000/api/certificates');
        certs.value = response.data;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao buscar certidões.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const saveCertificate = async () => {
    if (!newCert.value.type || !newCert.value.expiryDate) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos.', life: 3000 });
        return;
    }
    saving.value = true;
    try {
        await axios.post('http://localhost:5000/api/certificates', newCert.value);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Certidão cadastrada!', life: 3000 });
        showModal.value = false;
        newCert.value = { type: '', expiryDate: null, autoRenewal: false };
        fetchCertificates();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar certidão.', life: 3000 });
    } finally {
        saving.value = false;
    }
};

const validateCert = async (id) => {
    validatingId.value = id;
    try {
        await axios.post(`http://localhost:5000/api/certificates/${id}/validate`);
        toast.add({ severity: 'success', summary: 'Concluído', detail: 'Validação finalizada!', life: 2000 });
        fetchCertificates();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha na validação automática.', life: 3000 });
    } finally {
        validatingId.value = null;
    }
};

const deleteCert = async (id) => {
    try {
        await axios.delete(`http://localhost:5000/api/certificates/${id}`);
        toast.add({ severity: 'info', summary: 'Removido', detail: 'Certidão excluída.', life: 2000 });
        fetchCertificates();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir.', life: 3000 });
    }
};

const getStatusStyles = (status) => {
    switch (status) {
        case 'Válida':
            return { severity: 'success', icon: 'pi pi-check-circle', color: 'text-green-400', bg: 'bg-green-900' };
        case 'Vencida':
            return { severity: 'danger', icon: 'pi pi-bolt', color: 'text-red-400', bg: 'bg-red-900' };
        case 'A vencer':
            return { severity: 'warning', icon: 'pi pi-clock', color: 'text-orange-400', bg: 'bg-orange-900' };
        default:
            return { severity: 'info', icon: 'pi pi-question-circle', color: 'text-blue-400', bg: 'bg-blue-900' };
    }
};

onMounted(fetchCertificates);
</script>

<style scoped>
.bg-green-900 { background: rgba(34, 197, 94, 0.1); }
.bg-red-900 { background: rgba(239, 68, 68, 0.1); }
.bg-orange-900 { background: rgba(234, 179, 8, 0.1); }
.bg-blue-900 { background: rgba(59, 130, 246, 0.1); }
.bg-black-transparent { background: #000 !important; }

/* Customização para o modal no tema black */
:deep(.p-dialog-header), :deep(.p-dialog-content), :deep(.p-dialog-footer) {
    background: #141417 !important;
    color: white !important;
}

:deep(.p-inputtext) {
    background: #000 !important;
    border: 1px solid #26262b !important;
    color: white !important;
}
</style>

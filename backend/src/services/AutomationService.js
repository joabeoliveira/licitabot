import axios from 'axios';

/**
 * AutomationService - Orquestrador do motor n8n
 */
class AutomationService {
    constructor() {
        this.client = axios.create({
            baseURL: process.env.N8N_API_URL || 'http://n8n:5678/api/v1',
            headers: {
                'X-N8N-API-KEY': process.env.N8N_API_KEY
            }
        });
    }

    /**
     * Dispara um workflow específico no n8n via Webhook
     * @param {string} webhookPath - O path configurado no nó 'Webhook' do n8n
     * @param {object} data - Payload contendo userId e parâmetros da tarefa
     */
    async triggerWorkflow(webhookPath, data) {
        try {
            const url = `${process.env.N8N_WEBHOOK_URL || 'http://n8n:5678'}/webhook/${webhookPath}`;
            console.log(`[Automation] Disparando workflow: ${url}`);

            const response = await axios.post(url, {
                ...data,
                timestamp: new Date().toISOString(),
                source: 'licitabot-backend'
            });

            return response.data;
        } catch (error) {
            console.error(`[Automation] Erro ao disparar workflow ${webhookPath}:`, error.message);
            throw new Error('Falha na comunicação com o motor de automação.');
        }
    }

    /**
     * Busca os workflows ativos (para o futuro componente de biblioteca)
     */
    async getWorkflows() {
        try {
            const response = await this.client.get('/workflows');
            return response.data;
        } catch (error) {
            console.error('[Automation] Erro ao buscar lista de workflows:', error.message);
            return [];
        }
    }
}

export default new AutomationService();

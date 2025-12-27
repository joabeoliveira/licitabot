import axios from 'axios';

const PNCP_BASE_URL = 'https://pncp.gov.br/api/search/';
const PNCP_DETAIL_URL = 'https://pncp.gov.br/api/pncp/v1';

// Novas APIs sugeridas pelo usuário
const COMPRAS_MAT_URL = 'https://dadosabertos.compras.gov.br/modulo-pesquisa-preco/1_consultarMaterial';
const COMPRAS_SERV_URL = 'https://dadosabertos.compras.gov.br/modulo-pesquisa-preco/3_consultarServico';

class PriceService {
    /**
     * Analisa preços baseado em texto (PNCP) ou códigos CATMAT/CATSER (Compras.gov.br)
     */
    async analyzePrices(options) {
        const { q, mode, uf } = options;

        // Se o modo for catmat ou catser, usamos a nova API estruturada
        if (mode === 'catmat' || mode === 'catser') {
            return this.analyzeByCode(q, mode, uf);
        }

        // Caso contrário, mantemos a busca por texto no PNCP (fallback/default)
        return this.analyzeByText(q);
    }

    /**
     * Busca por CATMAT ou CATSER usando a API de Dados Abertos
     */
    async analyzeByCode(code, mode, uf) {
        try {
            const baseUrl = mode === 'catmat' ? COMPRAS_MAT_URL : COMPRAS_SERV_URL;
            const params = {
                pagina: 1,
                tamanhoPagina: 50,
                codigoItemCatalogo: code
            };

            if (uf) params.estado = uf;

            console.log(`[PriceService] Buscando ${mode} ${code} em ${uf || 'Brasil'}`);

            const response = await axios.get(baseUrl, { params });
            const rawItems = response.data.resultado || [];

            if (rawItems.length === 0) {
                return { stats: { min: 0, max: 0, avg: 0, count: 0 }, history: [] };
            }

            const items = rawItems.map(item => ({
                description: item.descricaoItem || (mode === 'catmat' ? 'Item de Material' : 'Prestação de Serviço'),
                date: item.dataResultado || item.dataCompra,
                organ: item.nomeUasg || item.orgaoNome,
                unitPrice: Number(item.precoUnitario || 0),
                unit: item.siglaUnidadeMedida || 'un',
                uf: item.siglaUf,
                link: '#' // Esta API não fornece link direto pro portal, mas podemos tentar montar depois
            })).filter(i => i.unitPrice > 0);

            if (items.length === 0) {
                return { stats: { min: 0, max: 0, avg: 0, count: 0 }, history: [] };
            }

            return this.calculateStats(items);

        } catch (error) {
            console.error(`Error in analyzeByCode (${mode}):`, error.message);
            throw new Error(`Falha ao consultar ${mode.toUpperCase()} no Compras.gov.br`);
        }
    }

    /**
     * Busca por Texto no PNCP (Lógica anterior já refinada)
     */
    async analyzeByText(query) {
        try {
            const params = {
                q: query,
                tipos_documento: 'edital',
                ordenacao: '-data',
                pagina: 1,
                tam_pagina: 6
            };

            const response = await axios.get(PNCP_BASE_URL, {
                params,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const tenders = response.data.items || [];

            if (tenders.length === 0) {
                return { stats: { min: 0, max: 0, avg: 0, count: 0 }, history: [] };
            }

            const allMatchingItems = [];
            for (const tender of tenders) {
                try {
                    const itemsUrl = `${PNCP_DETAIL_URL}/orgaos/${tender.orgao_cnpj}/compras/${tender.ano}/${tender.numero_sequencial}/itens?pagina=1&tam_pagina=100`;
                    const itemsResp = await axios.get(itemsUrl, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } });
                    const items = Array.isArray(itemsResp.data) ? itemsResp.data : [];

                    items.filter(i =>
                        (i.descricao && i.descricao.toLowerCase().includes(query.toLowerCase())) &&
                        (i.valorUnitarioEstimado > 0 || i.valorUnitarioHomologado > 0)
                    ).forEach(i => {
                        allMatchingItems.push({
                            description: i.descricao,
                            date: tender.data_publicacao,
                            organ: tender.orgao_nome,
                            unitPrice: i.valorUnitarioHomologado || i.valorUnitarioEstimado,
                            unit: i.unidadeMedida || 'un',
                            link: `https://pncp.gov.br/app/editais/${tender.orgao_cnpj}/${tender.ano}/${tender.numero_sequencial}`
                        });
                    });
                } catch (e) { }
            }

            if (allMatchingItems.length === 0) {
                return { stats: { min: 0, max: 0, avg: 0, count: 0 }, history: [] };
            }

            return this.calculateStats(allMatchingItems);
        } catch (error) {
            console.error('Error in analyzeByText:', error.message);
            throw new Error('Falha ao analisar preços no PNCP.');
        }
    }

    calculateStats(items) {
        const prices = items.map(i => i.unitPrice);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

        return {
            stats: { min, max, avg, count: prices.length },
            history: items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20)
        };
    }
}

export default new PriceService();

import axios from 'axios';

const PNCP_BASE_URL = 'https://pncp.gov.br/api/search/';
const PNCP_DETAIL_URL = 'https://pncp.gov.br/api/consulta/v1';

class TenderService {
    /**
     * Fetch open tenders (propostas abertas) from PNCP Search API
     * @param {number} page - Page number (starts at 1)
     * @param {number} size - Items per page
     */
    async fetchOpenTenders(page = 1, size = 10, query = '', ufs = '') {
        console.log(`Service Fetch called: page=${page}, query="${query}", ufs="${ufs}"`);
        try {
            const params = {
                tipos_documento: 'edital',
                ordenacao: '-data',
                pagina: page,
                tam_pagina: size,
                status: 'recebendo_proposta'
            };

            if (query && query.trim()) params.q = query.trim();
            if (ufs && ufs !== 'null') params.ufs = ufs;

            const response = await axios.get(PNCP_BASE_URL, {
                params,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            // Enriquecer com valores (limitado para performance)
            if (response.data && response.data.items) {
                const items = response.data.items;
                const enrichedItems = await Promise.all(items.map(async (item) => {
                    if (item.valor_global !== null) return item;

                    try {
                        const detailUrl = `${PNCP_DETAIL_URL}/orgaos/${item.orgao_cnpj}/compras/${item.ano}/${item.numero_sequencial}`;
                        const detailResp = await axios.get(detailUrl, {
                            timeout: 3000,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                            }
                        });
                        return {
                            ...item,
                            valor_global: detailResp.data.valorTotalEstimado || detailResp.data.valorTotalHomologado || 0
                        };
                    } catch (e) {
                        return item; // Fallback para o item original
                    }
                }));
                response.data.items = enrichedItems;
            }

            return response.data;
        } catch (error) {
            if (error.response) {
                console.error('PNCP API Error Details:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('Network Error:', error.message);
            }
            throw new Error('Falha ao buscar editais do PNCP. Tente novamente em instantes.');
        }
    }

    /**
     * Map PNCP Search API data structure to our internal Tender model
     */
    mapPncpToInternal(pncpData) {
        if (!pncpData || !pncpData.items) return [];

        return pncpData.items.map(item => ({
            title: item.title || item.description || 'Sem título',
            description: item.description,
            openingDate: item.data_fim_vigencia,
            estimatedValue: item.valor_global || 0,
            status: 'Aberto',
            source: 'PNCP',
            externalId: item.numero_controle_pncp || item.id,
            organ: item.orgao_nome,
            region: `${item.municipio_nome || ''} - ${item.uf || ''}`,
            externalLink: `https://pncp.gov.br/app/editais/${item.orgao_cnpj}/${item.ano}/${item.numero_sequencial}`
        }));
    }
}

export default new TenderService();

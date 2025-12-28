import Tender from '../models/Tender.js';

/**
 * WebhookController - Lida com as respostas vindas do n8n
 */
class WebhookController {
    /**
     * Recebe novos editais encontrados pelo Radar PNCP
     * POST /api/webhooks/n8n-response
     */
    async handleN8nResponse(req, res) {
        try {
            const { type, data, userId } = req.body;
            console.log(`[Webhook] Recebendo dados do n8n: Tipo=${type}, Usuário=${userId}`);

            if (type === 'NEW_TENDERS') {
                const results = [];
                for (const tenderData of data) {
                    // Upsert para não duplicar editais
                    const tender = await Tender.findOneAndUpdate(
                        { externalId: tenderData.externalId, user: userId },
                        { ...tenderData, user: userId },
                        { upsert: true, new: true }
                    );
                    results.push(tender);
                }
                return res.status(200).json({
                    success: true,
                    message: `${results.length} editais processados.`,
                    count: results.length
                });
            }

            // Outros tipos de resposta (Compliance, Price Analyzer) podem ser adicionados aqui

            return res.status(200).json({ success: true, message: 'Webhook recebido, mas nenhum processamento definido para este tipo.' });

        } catch (error) {
            console.error('[Webhook Error]:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default new WebhookController();

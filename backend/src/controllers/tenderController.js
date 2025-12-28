import TenderService from '../services/TenderService.js';
import Tender from '../models/Tender.js';
import AutomationService from '../services/AutomationService.js';

/**
 * Get tenders from external APIs (PNCP) for the Radar view
 */
export const getExternalTenders = async (req, res) => {
    try {
        const { page = 1, size = 10, q = '', ufs = '' } = req.query;
        const pncpData = await TenderService.fetchOpenTenders(page, size, q, ufs);
        let mappedTenders = TenderService.mapPncpToInternal(pncpData);

        // Check if any of these tenders are already saved by the user (with AI analysis)
        if (req.user && req.user.id) {
            const externalIds = mappedTenders.map(t => t.externalId);
            const locallySavedTenders = await Tender.find({
                user: req.user.id,
                externalId: { $in: externalIds }
            }).select('externalId aiScore aiJustification').lean();

            // Create a map for quick lookup
            const savedMap = new Map();
            locallySavedTenders.forEach(t => {
                savedMap.set(t.externalId, t);
            });

            mappedTenders = mappedTenders.map(t => {
                const localData = savedMap.get(t.externalId);
                return {
                    ...t,
                    saved: !!localData,
                    aiScore: localData?.aiScore || 0,
                    aiJustification: localData?.aiJustification || ''
                };
            });
        }

        res.json({
            success: true,
            count: mappedTenders.length,
            total: pncpData.total || mappedTenders.length,
            data: mappedTenders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get tenders saved in our database
 */
export const getSavedTenders = async (req, res) => {
    try {
        const tenders = await Tender.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: tenders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Save an external tender to our database (favorites/monitoring)
 */
export const saveTender = async (req, res) => {
    try {
        const tenderData = { ...req.body, user: req.user.id };
        const tender = await Tender.findOneAndUpdate(
            { externalId: req.body.externalId, user: req.user.id },
            tenderData,
            { upsert: true, new: true }
        );
        res.json({
            success: true,
            data: tender
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Trigger the Radar Workflow in n8n
 */
export const triggerRadar = async (req, res) => {
    try {
        const { query, ufs } = req.body;
        const userId = req.user.id;

        // Dispara o workflow no n8n. O path 'radar-pncp' deve estar no nó Webhook do n8n.
        const result = await AutomationService.triggerWorkflow('radar-pncp', {
            userId,
            query,
            ufs
        });

        res.json({
            success: true,
            message: 'Radar disparado com sucesso no motor de automação.',
            n8nResponse: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao conectar com o n8n: ' + error.message
        });
    }
};

import TenderService from '../services/TenderService.js';
import Tender from '../models/Tender.js';

/**
 * Get tenders from external APIs (PNCP) for the Radar view
 */
export const getExternalTenders = async (req, res) => {
    try {
        const { page = 1, size = 10, q = '', ufs = '' } = req.query;
        const pncpData = await TenderService.fetchOpenTenders(page, size, q, ufs);
        let mappedTenders = TenderService.mapPncpToInternal(pncpData);

        // Check if any of these tenders are already saved by the user
        if (req.user && req.user.id) {
            const externalIds = mappedTenders.map(t => t.externalId);
            const savedTenders = await Tender.find({
                user: req.user.id,
                externalId: { $in: externalIds }
            }).select('externalId');

            const savedIds = new Set(savedTenders.map(t => t.externalId));
            mappedTenders = mappedTenders.map(t => ({
                ...t,
                saved: savedIds.has(t.externalId)
            }));
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

import PriceService from '../services/PriceService.js';

export const analyzePrice = async (req, res) => {
    try {
        const { q, mode = 'text', uf = '' } = req.query;

        if (!q) {
            return res.status(400).json({ success: false, message: 'Termo ou código de busca é obrigatório.' });
        }

        const result = await PriceService.analyzePrices({ q, mode, uf });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

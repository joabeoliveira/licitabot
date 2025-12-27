import Certificate from '../models/Certificate.js';

/**
 * Controller para gestão de Certidões e Conformidade
 */
class CertificateController {
    /**
     * Lista todas as certidões do usuário logado
     */
    async getAll(req, res) {
        try {
            const certificates = await Certificate.find({ userId: req.user._id }).sort({ expiryDate: 1 });
            res.json(certificates);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar certidões.', error: error.message });
        }
    }

    /**
     * Adiciona uma nova certidão
     */
    async create(req, res) {
        try {
            const { type, expiryDate, issueDate, autoRenewal } = req.body;

            // Lógica simples para determinar status inicial
            let status = 'Válida';
            const now = new Date();
            const exp = new Date(expiryDate);

            if (exp < now) {
                status = 'Vencida';
            } else if ((exp - now) < (30 * 24 * 60 * 60 * 1000)) { // Menos de 30 dias
                status = 'A vencer';
            }

            const cert = new Certificate({
                userId: req.user._id,
                type,
                issueDate,
                expiryDate,
                status,
                autoRenewal: autoRenewal || false
            });

            await cert.save();
            res.status(201).json(cert);
        } catch (error) {
            res.status(400).json({ message: 'Erro ao criar certidão.', error: error.message });
        }
    }

    /**
     * Simula a validação automática (Feature P0 do PRD)
     */
    async validate(req, res) {
        try {
            const cert = await Certificate.findOne({ _id: req.params.id, userId: req.user._id });
            if (!cert) return res.status(404).json({ message: 'Certidão não encontrada.' });

            // Simulação de delay para "processamento"
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulação de lógica de verificação
            const now = new Date();
            if (cert.expiryDate < now) {
                cert.status = 'Vencida';
            } else if ((cert.expiryDate - now) < (15 * 24 * 60 * 60 * 1000)) {
                cert.status = 'A vencer';
            } else {
                cert.status = 'Válida';
            }

            await cert.save();
            res.json({ message: 'Validação concluída com sucesso.', certificate: cert });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao validar certidão.', error: error.message });
        }
    }

    /**
     * Remove uma certidão
     */
    async delete(req, res) {
        try {
            const result = await Certificate.deleteOne({ _id: req.params.id, userId: req.user._id });
            if (result.deletedCount === 0) return res.status(404).json({ message: 'Certidão não encontrada.' });
            res.json({ message: 'Certidão removida com sucesso.' });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao remover certidão.', error: error.message });
        }
    }
}

export default new CertificateController();

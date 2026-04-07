import { Router } from 'express';
const router = Router();
router.get('/health', (_req, res) => res.status(200).json({ ok: true, app: 'collectors-vault-baseapp' }));
export default router;

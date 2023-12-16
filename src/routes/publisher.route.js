import express from 'express'

import {
  createPublisher,
  deletePublisher,
  forceDeletePublisher,
  getAllDeletePublisher,
  getAllPublishers,
  getPublisherById,
  restorePublisher,
  updatePublisher
} from '../app/controllers/publisher.controller'
import {
  verifyTokenAndAdminAuth,
  verifyTokenMember
} from '../app/middlewares/auth.middleware'

const router = express.Router()

router.post('/publishers/add', verifyTokenMember, createPublisher)
router.patch('/publishers/:id/update', verifyTokenMember, updatePublisher)
router.get('/publishers/:id/getById', verifyTokenMember, getPublisherById)
router.delete(
  '/publishers/:id/delete',
  verifyTokenAndAdminAuth,
  deletePublisher
)
router.patch(
  '/publishers/:id/restore',
  verifyTokenAndAdminAuth,
  restorePublisher
)
router.delete(
  '/publishers/:id/force',
  verifyTokenAndAdminAuth,
  forceDeletePublisher
)
router.get('/publishers', getAllPublishers)
router.get('/publishers/trash', verifyTokenAndAdminAuth, getAllDeletePublisher)
export default router

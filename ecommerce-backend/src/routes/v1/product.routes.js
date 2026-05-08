import { Router } from 'express'
import { authenticate, authorize } from '../../middlewares/auth.js'
import { validate, validateQuery } from '../../middlewares/validate.js'
import { ProductController } from '../../controllers/product.controller.js'
import {
    createProductSchema,
    updateProductSchema,
    productQuerySchema,
} from '../../validators/product.validator.js'
import { upload } from '../../config/cloudinary.js';

const router = Router()

// Public routes
router.get('/',    validateQuery(productQuerySchema), ProductController.getAll)
router.get('/:id', ProductController.getById)
router.post('/upload-url', authenticate, authorize('admin'), ProductController.uploadUrl)

// Admin only
router.use(authenticate, authorize('admin'))
router.post('/', upload.single('imageUrl'),   validate(createProductSchema), ProductController.create)
router.patch('/:id', validate(updateProductSchema), ProductController.update)
router.delete('/:id', ProductController.delete)

export default router

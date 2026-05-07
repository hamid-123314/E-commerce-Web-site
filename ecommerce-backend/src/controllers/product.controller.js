import { ProductService } from '../services/product.service.js'

export class ProductController {
  static async getAll(req, res, next) {
    try {
      const result = await ProductService.findMany(req.query)
      res.status(200).json({ status: 'success', data: result })
    } catch (err) { next(err) }
  }

  static async getById(req, res, next) {
    try {
      const product = await ProductService.findById(req.params.id)
      res.status(200).json({ status: 'success', data: { product } })
    } catch (err) { next(err) }
  }

  static async create(req, res, next) {
    try {
      const product = await ProductService.create(req.body)
      res.status(201).json({ status: 'success', data: { product } })
    } catch (err) { next(err) }
  }

  static async update(req, res, next) {
    try {
      const product = await ProductService.update(req.params.id, req.body)
      res.status(200).json({ status: 'success', data: { product } })
    } catch (err) { next(err) }
  }

  static async delete(req, res, next) {
    try {
      await ProductService.delete(req.params.id)
      res.status(204).send()
    } catch (err) { next(err) }
  }
}
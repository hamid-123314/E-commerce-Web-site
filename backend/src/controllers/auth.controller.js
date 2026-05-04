import { AuthService } from '../services/auth.service.js'

// Controllers are thin — they only handle HTTP concerns:
// extract inputs, call service, send response.
// Zero business logic here.

export class AuthController {

    static async regiter(req, res, next) {
        try {
            const { user, accessToken, refreshToken } = await AuthService.register(req.body)
            res.status(201).json({ status: 'success', data: { user, accessToken, refreshToken } })
        } catch(err) { next(err) }
    }

    static async login(req, res, next) {
        try {
            const { user, accessToken, refreshToken } = await AuthService.login(req.body)
            res.json({ status: 'success', data: { user, accessToken, refreshToken } })
        } catch(err) { next(err) }
    }

    static async refresh(req, res, nest) {
        try {
            const { refreshToken } = req.body
            const tokens = await AuthService.refreshToken(refreshToken)
            res.status(200).json({ status: 'success', data: tokens })
        } catch(err) { next(err) }
    }

    static async logout(req, res, next) {
        try {
            const { refreshToken } = req.body
            await AuthService.logout(req.user.id, refreshToken)
            res.status(204).send()
        } catch(err) { next(err) }
    }

}
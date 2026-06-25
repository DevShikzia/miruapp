import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { IUserPublic } from '@shared/types/auth.types'
import { logger, PREFIXES } from '../utils/logger'

declare module 'socket.io' {
  interface Socket {
    user: IUserPublic
  }
}

let io: Server | null = null

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Token requerido'))

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as IUserPublic
      socket.user = decoded
      next()
    } catch {
      next(new Error('Token inválido'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const user = socket.user
    logger.info(PREFIXES.SOCKET, `Usuario conectado: ${user._id}`)

    if (user.familyId) {
      socket.join(`family:${user.familyId}`)
    }

    socket.on('disconnect', () => {
      logger.info(PREFIXES.SOCKET, `Usuario desconectado: ${user._id}`)
    })
  })

  return io
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io no inicializado')
  return io
}

export function emitToFamily(familyId: string, event: string, data: unknown): void {
  if (io) {
    io.to(`family:${familyId}`).emit(event, data)
  }
}

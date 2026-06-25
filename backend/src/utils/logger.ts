const PREFIXES = {
  CRON: '[CRON]',
  SOCKET: '[SOCKET]',
  SERVER: '[SERVER]',
} as const

type Prefix = (typeof PREFIXES)[keyof typeof PREFIXES]

export const logger = {
  info(prefix: Prefix, message: string): void {
    if (process.env.NODE_ENV === 'production') return
    console.log(`${prefix} ${message}`)
  },
  error(prefix: Prefix, message: string): void {
    console.error(`${prefix} ${message}`)
  },
}

export { PREFIXES }

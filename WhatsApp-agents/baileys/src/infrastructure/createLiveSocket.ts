//Mariano Montini ('bosque', 'bosquestudio')
import makeWASocket, { useMultiFileAuthState, type WASocket } from '@whiskeysockets/baileys'
import type { BaileysSocketLike } from './baileysAdapter.js'

// Live socket options - auth folder on disk (gitignored); QR is interactive.
export type LiveSocketOptions = {
  authDir: string
}

// Create live Baileys socket - pairing + creds persist. Tests must not call this.
export async function createLiveBaileysSocket(options: LiveSocketOptions): Promise<WASocket> {
  const { state, saveCreds } = await useMultiFileAuthState(options.authDir)

  const sock: WASocket = makeWASocket({
    auth: state,
  })

  sock.ev.on('creds.update', saveCreds)

  return sock
}

// Adapter socket view - presence + sendMessage used by BaileysClient.
export function asBaileysAdapterSocket(sock: WASocket): BaileysSocketLike {
  return sock as unknown as BaileysSocketLike
}

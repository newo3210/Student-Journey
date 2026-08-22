//Mariano Montini ('bosque', 'bosquestudio')
import type { Request } from 'express'

// Request with raw body - Buffer from express.json verify for HMAC validation.
export type RequestWithRawBody = Request & { rawBody?: Buffer }

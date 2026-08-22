//Mariano Montini ('bosque', 'bosquestudio')
import type { Request } from 'express'

// Request with raw body - Buffer from express.json verify for future signature hooks.
export type RequestWithRawBody = Request & { rawBody?: Buffer }

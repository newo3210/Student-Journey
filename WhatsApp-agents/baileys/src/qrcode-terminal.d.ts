//Mariano Montini ('bosque', 'bosquestudio')
declare module 'qrcode-terminal' {
  // QR printer API - generate ASCII QR for terminal pairing.
  function generate(input: string, opts?: { small?: boolean }): void
  const qrcodeTerminal: { generate: typeof generate }
  export default qrcodeTerminal
}

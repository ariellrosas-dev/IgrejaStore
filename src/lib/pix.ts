export interface PixConfig {
  pixKey: string
  merchantName: string
  merchantCity: string
  amount: number
  txid: string
}

function tlv(id: string, value: string) {
  return `${id}${value.length.toString().padStart(2, '0')}${value}`
}

function crc16(str: string): string {
  let crc = 0xFFFF
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1)
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')
}

export function generatePixPayload({ pixKey, merchantName, merchantCity, amount, txid }: PixConfig): string {
  const mai = tlv('00', 'BR.GOV.BCB.PIX') + tlv('01', pixKey)
  const adf = tlv('05', txid.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) || 'CHURCHGEAR')
  const raw = [
    tlv('00', '01'),
    tlv('26', mai),
    tlv('52', '0000'),
    tlv('53', '986'),
    tlv('54', amount.toFixed(2)),
    tlv('58', 'BR'),
    tlv('59', merchantName.substring(0, 25).toUpperCase()),
    tlv('60', merchantCity.substring(0, 15).toUpperCase()),
    tlv('62', adf),
    '6304',
  ].join('')
  return raw + crc16(raw)
}

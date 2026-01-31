/**
 * Parse amount from PromptPay QR string (EMVCo format)
 * Tag 54 = Transaction Amount
 *
 * Example QR: "00020101021229370016A000000677010111021300668888888885303764540610.005802TH..."
 * Tag 54 with length 06 and value "10.00" means amount = 10.00
 */
export function parsePromptPayAmount(qrString: string): number | null {
  if (!qrString || typeof qrString !== 'string') {
    return null;
  }

  // Find tag 54 (Transaction Amount)
  // Format: 54 + 2-digit length + value
  const tag54Match = qrString.match(/54(\d{2})(\d+\.?\d*)/);

  if (!tag54Match) {
    return null;
  }

  const length = parseInt(tag54Match[1], 10);
  const valueStr = tag54Match[2].substring(0, length);

  const amount = parseFloat(valueStr);

  if (isNaN(amount)) {
    return null;
  }

  return amount;
}

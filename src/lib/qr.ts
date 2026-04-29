import QRCode from "qrcode";

export function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, { width: 128, margin: 1 });
}

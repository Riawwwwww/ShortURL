import { useState } from 'react';

export default function ShortUrlResult({ result }) {
  const [copied, setCopied] = useState(false);
  if (!result) return null;

  async function copyUrl() {
    await navigator.clipboard.writeText(result.short_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return <section className="panel result-panel">
    <div className="panel-heading"><div><p className="eyebrow">RESULT</p><h2>ผลลัพธ์</h2></div></div>
    <div className="result-content"><img src={result.qr_code} className="qr-image" alt="QR Code สำหรับ Short URL" /><div className="result-details"><span className="result-label">SHORT URL</span><a href={result.short_url} target="_blank" rel="noreferrer">{result.short_url}</a><div className="result-actions"><button className="secondary-button" type="button" onClick={copyUrl}>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</button><a className="secondary-button" href={result.qr_code} download="shortly-qr-code.png">ดาวน์โหลด QR</a></div></div></div>
  </section>;
}

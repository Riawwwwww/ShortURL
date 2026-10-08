import { api } from '../api';

function formatDate(value) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function shorten(value, max = 52) {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export default function HistoryTable({ urls, onOpenQr }) {
  async function openQr(item) {
    const result = await api(`/api/urls/${item.short_url_id}/qr`);
    onOpenQr(result);
  }

  return (
    <section className="panel history-panel">
      <div className="panel-heading"><div><h2>ประวัติการสร้าง</h2></div></div>
      {urls.length === 0 ? <div className="history-empty">ยังไม่มี Short URL ลองสร้างรายการแรกของคุณ</div> : <div className="table-wrap"><table><thead><tr><th>URL ต้นฉบับ</th><th>SHORT URL</th><th>สร้างเมื่อ</th><th>CLICKS</th><th></th></tr></thead><tbody>{urls.map((item) => <tr key={item.short_url_id}>
        <td><span className="original-url" title={item.original_url}>{shorten(item.original_url)}</span></td>
        <td><a className="short-link" href={item.short_url} target="_blank" rel="noreferrer">{item.short_url}</a></td>
        <td>{formatDate(item.created_at)}</td>
        <td><span className="click-pill">{item.click_count}</span></td>
        <td><button className="row-qr" type="button" onClick={() => openQr(item)}>QR</button></td>
      </tr>)}</tbody></table></div>}
    </section>
  );
}

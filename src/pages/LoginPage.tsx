import type { FC } from "hono/jsx";
import { config } from "../config.js";
import { card, hidden, qrContainer, spinner, status, step, subtitle, title } from "../styles.js";
import { Layout } from "./Layout.js";
import { TwoFactorBlock, twoFactorSetupScript } from "./qr-2fa-inline.js";

const clientScript = `
  let eventSource = null;

  function startLogin() {
    document.getElementById('qr-section').style.display = 'block';

    eventSource = new EventSource('/login/qr');
    window.__setupTwoFactor(eventSource);

    eventSource.addEventListener('qr', (e) => {
      const data = JSON.parse(e.data);
      document.getElementById('qr-container').innerHTML =
        '<img src="' + data.dataUrl + '" alt="QR Code">';
    });

    eventSource.addEventListener('status', (e) => {
      const data = JSON.parse(e.data);
      document.getElementById('status').textContent = data.message;
    });

    eventSource.addEventListener('connected', (e) => {
      const data = JSON.parse(e.data);
      eventSource.close();
      document.getElementById('qr-section').style.display = 'none';
      const result = document.getElementById('result');
      result.style.display = 'block';
      result.innerHTML =
        '<div style="background:#F4F4F7;border:1px solid #007AFF;border-radius:12px;padding:20px;margin:20px 0">' +
        '<h2 style="color:#007AFF;font-size:20px;margin-bottom:8px">Connected!</h2>' +
        '<p>' + window.__esc(data.name || '') + ' (@' + window.__esc(data.username || 'unknown') + ')</p>' +
        '<p style="margin-top:12px;font-size:13px;color:#707579">Encrypted session saved. You can close this page.</p>' +
        '</div>';
    });

    eventSource.addEventListener('error_msg', (e) => {
      const data = JSON.parse(e.data);
      eventSource.close();
      document.getElementById('qr-section').style.display = 'none';
      const result = document.getElementById('result');
      result.style.display = 'block';
      result.innerHTML =
        '<div style="background:#F4F4F7;border:1px solid #E53935;border-radius:12px;padding:20px;margin:20px 0"><p>' + window.__esc(data.message) + '</p></div>';
    });

    eventSource.onerror = () => {
      document.getElementById('status').textContent = 'Connection lost. Refresh to retry.';
    };
  }

  startLogin();
`;

export const LoginPage: FC = () => {
  return (
    <Layout title={`${config.brandName} — Link Telegram`}>
      <div class={card}>
        <h1 class={title}>{config.brandName}</h1>
        <p class={subtitle}>Link any Telegram account</p>

        <div class={step}>
          <strong>Step 1:</strong> Open Telegram on the account you want to connect
        </div>
        <div class={step}>
          <strong>Step 2:</strong> Settings &gt; Devices &gt; Link Desktop Device
        </div>
        <div class={step}>
          <strong>Step 3:</strong> Scan the QR code below
        </div>

        <div id="qr-section">
          <div class={qrContainer} id="qr-container">
            <div class={spinner} />
          </div>
          <div class={status} id="status">
            Loading QR code...
          </div>
          <TwoFactorBlock />
        </div>

        <div id="result" class={hidden} />
      </div>

      <script dangerouslySetInnerHTML={{ __html: twoFactorSetupScript }} />
      <script dangerouslySetInnerHTML={{ __html: clientScript }} />
    </Layout>
  );
};

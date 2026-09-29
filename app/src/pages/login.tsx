import { renderToString } from "react-dom/server";
import { LanguageSwitcher } from "../components/LanguageSwitcher.js";
import { Layout } from "../components/Layout.js";
import { QrSection, qrCss } from "../components/QrSection.js";
import { createTranslator, getMessages } from "../i18n/index.js";
import { baseCss } from "../theme.js";

export type LoginProps = {
  locale: string;
  scripts?: readonly string[];
};

function LoginPage(props: LoginProps) {
  const { locale } = props;
  const t = createTranslator(getMessages(locale));

  return (
    <Layout
      locale={locale}
      title={`${t("common.brandName")} — ${t("login.title")}`}
      scripts={props.scripts}
      css={baseCss + qrCss}
    >
      <main
        className="card"
        style={{ maxWidth: 480, textAlign: "center" }}
        data-island="qr-flow"
        data-sse-url="/login/qr"
        data-auto="1"
        data-password-url="/qr/password"
        data-msg-connected={t("login.connected")}
        data-msg-saved={t("login.sessionSaved")}
        data-msg-lost={t("login.connectionLost")}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <LanguageSwitcher current={locale} label={t("common.languageLabel")} />
        </div>
        <h1>{t("common.brandName")}</h1>
        <p className="muted">{t("login.title")}</p>

        <div id="intro" style={{ textAlign: "start", marginTop: 16 }}>
          <div className="step">1. Open Telegram on the account you want to connect</div>
          <div className="step">2. Settings → Devices → Link Desktop Device</div>
          <div className="step">3. Scan the QR code</div>
        </div>

        <QrSection
          loadingText={t("login.connecting")}
          twoFactor={{
            title: t("twoFactor.title"),
            description: t("twoFactor.description"),
            passwordLabel: t("twoFactor.passwordLabel"),
            submit: t("twoFactor.submit"),
          }}
        />
      </main>
    </Layout>
  );
}

export function render(props: LoginProps): string {
  return `<!DOCTYPE html>${renderToString(<LoginPage {...props} />)}`;
}

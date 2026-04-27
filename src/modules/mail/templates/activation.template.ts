export function activationTemplate(name: string, url: string): string {
    return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Activá tu cuenta</title>
  </head>
  <body style="margin:0;padding:0;background:#0f0f0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:48px 0;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
  
            <!-- HEADER -->
            <tr>
              <td style="background:linear-gradient(135deg,#c8a96e 0%,#e8c87e 50%,#c8a96e 100%);padding:40px 48px;text-align:center;">
                <h1 style="margin:0;font-size:32px;font-weight:800;letter-spacing:6px;color:#0f0f0f;text-transform:uppercase;">WAIONA</h1>
                <p style="margin:8px 0 0;font-size:11px;letter-spacing:3px;color:#0f0f0f;opacity:0.7;text-transform:uppercase;">Tu cuenta te espera</p>
              </td>
            </tr>
  
            <!-- BODY -->
            <tr>
              <td style="padding:48px;">
                <p style="margin:0 0 8px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#c8a96e;">Bienvenido/a</p>
                <h2 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#ffffff;">${name}</h2>
                <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#888888;">
                  Gracias por registrarte en Waiona. Para completar tu registro y activar tu cuenta, hacé clic en el botón de abajo.
                </p>
  
                <!-- BUTTON -->
                <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#c8a96e,#e8c87e);border-radius:8px;">
                      <a href="${url}" style="display:inline-block;padding:16px 40px;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0f0f0f;text-decoration:none;">
                        Activar cuenta
                      </a>
                    </td>
                  </tr>
                </table>
  
                <p style="margin:0 0 8px;font-size:13px;color:#555555;">O copiá este link en tu navegador:</p>
                <p style="margin:0 0 32px;font-size:12px;color:#c8a96e;word-break:break-all;">${url}</p>
  
                <hr style="border:none;border-top:1px solid #2a2a2a;margin:0 0 24px;" />
                <p style="margin:0;font-size:12px;color:#555555;line-height:1.6;">
                  Este link expira en <strong style="color:#888888;">24 horas</strong>. Si no creaste una cuenta en Waiona, ignorá este email.
                </p>
              </td>
            </tr>
  
            <!-- FOOTER -->
            <tr>
              <td style="padding:24px 48px;background:#141414;text-align:center;">
                <p style="margin:0;font-size:11px;letter-spacing:1px;color:#444444;">© ${new Date().getFullYear()} Waiona · Todos los derechos reservados</p>
              </td>
            </tr>
  
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
  }
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || '';

export async function sendConfirmationEmail(toEmail, toName) {
  const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  console.log('Código de confirmação:', confirmationCode);
  console.log('Enviando email para:', toEmail);
  
  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #0d1117; margin: 0;">Confirmação de Cadastro</h1>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Olá <strong>${toName}</strong>!
        </p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Obrigado por se cadastrar na Loja de Camisas. Para confirmar seu cadastro, utilize o código abaixo:
        </p>
        
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #0d1117; letter-spacing: 8px;">
            ${confirmationCode}
          </span>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Este código é válido por 24 horas.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          Se você não criou esta conta, ignore este email.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: 'Loja de Camisas',
          email: 'contato@lojacamisas.com.br'
        },
        to: [
          { email: toEmail, name: toName }
        ],
        subject: 'Confirme seu cadastro - Loja de Camisas',
        htmlContent: emailContent
      })
    });

    const result = await response.json();
    console.log('Resposta do Brevo:', result);
    
    if (response.ok) {
      return { success: true, code: confirmationCode };
    } else {
      console.error('Erro ao enviar email:', result);
      return { success: false, error: result.message || 'Erro desconhecido' };
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    return { success: false, error: error.message };
  }
}
  } catch (error) {
    console.error('Erro na requisição:', error);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail(toEmail, toName) {
  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #0d1117; text-align: center;">Bem-vindo!</h1>
        <p style="color: #333; font-size: 16px;">
          Olá <strong>${toName}</strong>!
        </p>
        <p style="color: #333; font-size: 16px;">
          Seu cadastro foi confirmado com sucesso! Agora você pode fazer compras em nossa loja.
        </p>
        <p style="color: #666; font-size: 14px;">
          Atenciosamente,<br>Loja de Camisas
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: 'Loja de Camisas',
          email: 'contato@lojacamisas.com.br'
        },
        to: [
          { email: toEmail, name: toName }
        ],
        subject: 'Bem-vindo à Loja de Camisas!',
        htmlContent: emailContent
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}

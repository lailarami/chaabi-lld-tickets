<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Declaration Niveau +2</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 620px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .header { background: #FFA500; padding: 28px 32px; text-align: center; }
  .header img { height: 50px; margin-bottom: 12px; }
  .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
  .badge { display: inline-block; background: #fff; color: #FFA500; border-radius: 20px; padding: 5px 18px; font-weight: 700; font-size: 13px; margin-top: 10px; }
  .body { padding: 32px; }
  .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
  .info-box { background: #FFF8F0; border-left: 4px solid #FFA500; border-radius: 4px; padding: 18px 22px; margin-bottom: 24px; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
  .info-label { color: #888; font-weight: 600; min-width: 140px; }
  .info-value { color: #222; font-weight: 500; text-align: right; }
  .status-badge { background: #FFE4B5; color: #FF8C00; border: 1px solid #FFD699; border-radius: 20px; padding: 3px 14px; font-size: 13px; font-weight: 700; }
  .message { background: #f9f9f9; border-radius: 6px; padding: 16px 20px; font-size: 14px; color: #555; line-height: 1.7; margin-bottom: 24px; }
  .footer { background: #f4f4f4; padding: 18px 32px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
  .footer strong { color: #FFA500; }
  .important { color: #FF4500; font-weight: 700; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <img src="https://entreprise.groupebcp.com/fr/PublishingImages/GBP_FINvestissement/Logo-Chaabi-LLD.png" alt="Chaabi LLD">
    <h1>DECLARATION NIVEAU +2</h1>
    <span class="badge">📧 NOUVELLE DEMANDE</span>
  </div>
  <div class="body">
    <p class="greeting">Bonjour,</p>
    <p style="font-size:15px;color:#555;">Vous avez reçu une <strong>nouvelle déclaration niveau +2</strong> de la part de <strong>Chaabi LLD</strong>. Veuillez trouver ci-dessous les détails :</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Statut</span>
        <span class="info-value"><span class="status-badge">⏳ EN ATTENTE</span></span>
      </div>
      <div class="info-row">
        <span class="info-label">Date d'envoi</span>
        <span class="info-value">{{ now()->format('d/m/Y à H:i') }}</span>
      </div>
    </div>

    <h3 style="color:#333;margin-top:24px;margin-bottom:16px;font-size:16px;">📋 Description de la demande :</h3>
    <div class="message">
      {!! nl2br(e($description)) !!}
    </div>

    <div style="background:#fff3cd;border-left:4px solid #ffc107;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#333;">
        <strong style="color:#FF4500;">⚠️ Veuillez noter :</strong><br>
        Si une pièce jointe était incluse, vous la trouverez ci-dessous.
      </p>
    </div>

    <p style="font-size:14px;color:#666;margin-top:20px;">
      Si vous avez des questions ou besoin de clarifications, veuillez contacter le département support de Chaabi LLD.
    </p>
  </div>
  <div class="footer">
    <p style="margin:0;">
      © {{ date('Y') }} <strong>Chaabi LLD</strong> — Gestion des Demandes d'Achat<br>
      Cet email a été généré automatiquement. Veuillez ne pas y répondre directement.
    </p>
  </div>
</div>
</body>
</html>

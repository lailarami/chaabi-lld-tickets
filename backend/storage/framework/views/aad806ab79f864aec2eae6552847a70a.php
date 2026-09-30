<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Demande d'achat Validée</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 620px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .header { background: #28A745; padding: 28px 32px; text-align: center; }
  .header img { height: 50px; margin-bottom: 12px; }
  .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
  .badge { display: inline-block; background: #fff; color: #28A745; border-radius: 20px; padding: 5px 18px; font-weight: 700; font-size: 13px; margin-top: 10px; }
  .body { padding: 32px; }
  .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
  .info-box { background: #F0FFF4; border-left: 4px solid #28A745; border-radius: 4px; padding: 18px 22px; margin-bottom: 24px; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
  .info-label { color: #888; font-weight: 600; min-width: 140px; }
  .info-value { color: #222; font-weight: 500; text-align: right; }
  .status-badge { background: #D4EDDA; color: #155724; border: 1px solid #C3E6CB; border-radius: 20px; padding: 3px 14px; font-size: 13px; font-weight: 700; }
  .message { background: #f9f9f9; border-radius: 6px; padding: 16px 20px; font-size: 14px; color: #555; line-height: 1.7; margin-bottom: 24px; }
  .footer { background: #f4f4f4; padding: 18px 32px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
  .footer strong { color: #28A745; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <img src="https://entreprise.groupebcp.com/fr/PublishingImages/GBP_FINvestissement/Logo-Chaabi-LLD.png" alt="Chaabi LLD">
    <h1>GESTION DES DEMANDES D'ACHAT</h1>
    <span class="badge">✓ DEMANDE VALIDÉE</span>
  </div>
  <div class="body">
    <p class="greeting">Bonjour,</p>
    <p style="font-size:15px;color:#555;">Nous vous confirmons que votre <strong>demande d'achat</strong> a été <strong>approuvée</strong>. Vous pouvez procéder à la facturation.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Référence demande</span>
        <span class="info-value"><strong>#<?php echo e($demande->id_demande); ?></strong></span>
      </div>
      <div class="info-row">
        <span class="info-label">Ticket associé</span>
        <span class="info-value"><strong>#<?php echo e($demande->id_ticket); ?></strong></span>
      </div>
      <div class="info-row">
        <span class="info-label">Objet</span>
        <span class="info-value"><?php echo e($demande->objet); ?></span>
      </div>
      <div class="info-row">
        <span class="info-label">Prestataire</span>
        <span class="info-value"><?php echo e($demande->email_prestataire); ?></span>
      </div>
      <div class="info-row">
        <span class="info-label">Statut</span>
        <span class="info-value"><span class="status-badge">Validée</span></span>
      </div>
      <div class="info-row">
        <span class="info-label">Date validation</span>
        <span class="info-value"><?php echo e(\Carbon\Carbon::now()->format('d/m/Y')); ?></span>
      </div>
    </div>

    <div class="message">
      <strong>Description de la demande :</strong><br>
      <?php echo e($demande->description); ?>

    </div>

    <p style="font-size:14px;color:#666;">Si vous avez des questions, contactez notre équipe de support.</p>
  </div>
  <div class="footer">
    <p style="margin: 0;">Chaabi LLD - Support IT<br>
    <strong><?php echo e(config('app.url')); ?></strong></p>
  </div>
</div>
</body>
</html>
<?php /**PATH C:\react-projects\chaabi-lld\backend\resources\views/emails/demande-achat-validee.blade.php ENDPATH**/ ?>
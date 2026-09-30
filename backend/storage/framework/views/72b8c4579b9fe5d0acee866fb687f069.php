<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ticket Résolu</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 620px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .header { background: #F58220; padding: 28px 32px; text-align: center; }
  .header img { height: 50px; margin-bottom: 12px; }
  .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
  .badge { display: inline-block; background: #fff; color: #28a745; border-radius: 20px; padding: 5px 18px; font-weight: 700; font-size: 13px; margin-top: 10px; }
  .body { padding: 32px; }
  .info-box { background: #F0FFF4; border-left: 4px solid #28a745; border-radius: 4px; padding: 18px 22px; margin-bottom: 24px; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
  .info-label { color: #888; font-weight: 600; min-width: 140px; }
  .info-value { color: #222; font-weight: 500; text-align: right; }
  .status-badge { background: #D4EDDA; color: #155724; border: 1px solid #C3E6CB; border-radius: 20px; padding: 3px 14px; font-size: 13px; font-weight: 700; }
  .message { background: #f9f9f9; border-radius: 6px; padding: 16px 20px; font-size: 14px; color: #555; line-height: 1.7; margin-bottom: 24px; }
  .footer { background: #f4f4f4; padding: 18px 32px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
  .footer strong { color: #F58220; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <img src="https://entreprise.groupebcp.com/fr/PublishingImages/GBP_FINvestissement/Logo-Chaabi-LLD.png" alt="Chaabi LLD">
    <h1>SYSTÈME DE GESTION DES TICKETS</h1>
    <span class="badge">✅ TICKET RÉSOLU</span>
  </div>
  <div class="body">
    <p style="font-size:15px;color:#555;">Bonjour <strong><?php echo e($ticket->utilisateur->nom); ?></strong>,</p>
    <p style="font-size:15px;color:#555;">Nous avons le plaisir de vous informer que votre ticket a été <strong>résolu</strong> par notre équipe technique. Veuillez vérifier la résolution et contacter le support si nécessaire.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Référence ticket</span>
        <span class="info-value"><strong>#<?php echo e($ticket->id_ticket); ?></strong></span>
      </div>
      <div class="info-row">
        <span class="info-label">Objet</span>
        <span class="info-value"><?php echo e($ticket->objet_ticket); ?></span>
      </div>
      <div class="info-row">
        <span class="info-label">Catégorie</span>
        <span class="info-value"><?php echo e($ticket->categorie->nom); ?></span>
      </div>
      <div class="info-row">
        <span class="info-label">Priorité</span>
        <span class="info-value"><?php echo e(ucfirst($ticket->priorite)); ?></span>
      </div>
      <div class="info-row">
        <span class="info-label">Statut</span>
        <span class="info-value"><span class="status-badge">Résolu</span></span>
      </div>
      <div class="info-row">
        <span class="info-label">Date de création</span>
        <span class="info-value"><?php echo e(\Carbon\Carbon::parse($ticket->date_creation)->format('d/m/Y')); ?></span>
      </div>
      <div class="info-row">
        <span class="info-label">Date d'ouverture</span>
        <span class="info-value"><?php echo e(\Carbon\Carbon::parse($ticket->date_ouverture)->format('d/m/Y')); ?></span>
      </div>
      <div class="info-row">
        <span class="info-label">Date de clôture</span>
        <span class="info-value"><?php echo e(\Carbon\Carbon::parse($ticket->date_cloture)->format('d/m/Y')); ?></span>
      </div>
      <?php if($ticket->traiteur): ?>
      <div class="info-row">
        <span class="info-label">Résolu par</span>
        <span class="info-value"><?php echo e($ticket->traiteur->nom); ?></span>
      </div>
      <?php endif; ?>
      <?php if($ticket->typologie): ?>
      <div class="info-row">
        <span class="info-label">Typologie</span>
        <span class="info-value"><?php echo e($ticket->typologie); ?></span>
      </div>
      <?php endif; ?>
      <?php if($ticket->id_sous_categorie): ?>
      <div class="info-row">
        <span class="info-label">Sous-catégorie</span>
        <span class="info-value"><?php echo e($ticket->id_sous_categorie); ?></span>
      </div>
      <?php endif; ?>
      <?php if($ticket->impact): ?>
      <div class="info-row">
        <span class="info-label">Impact</span>
        <span class="info-value"><?php echo e(ucfirst(str_replace('_', ' ', $ticket->impact))); ?></span>
      </div>
      <?php endif; ?>
    </div>

    <div class="message">
      <strong>Description du ticket :</strong><br>
      <?php echo e($ticket->description); ?>

    </div>

    <?php if($ticket->description && $ticket->typologie): ?>
    <div class="message">
      <strong>Détails de la résolution :</strong><br>
      <strong>Typologie:</strong> <?php echo e($ticket->typologie); ?><br>
      <strong>Sous-catégorie:</strong> <?php echo e($ticket->id_sous_categorie); ?><br>
      <strong>Impact:</strong> <?php echo e(ucfirst(str_replace('_', ' ', $ticket->impact))); ?><br>
      <strong>Description:</strong> <?php echo e($ticket->description); ?>

    </div>
    <?php endif; ?>

    <p style="font-size:13px;color:#888;">Ce ticket est en attente de validation. Pour tout renseignement, contactez le support IT de Chaabi LLD.</p>
  </div>
  <div class="footer">
    <strong>Chaabi LLD</strong> — Système de Gestion des Tickets IT<br>
    Cet email est généré automatiquement, merci de ne pas y répondre.
  </div>
</div>
</body>
</html>
<?php /**PATH C:\react-projects\chaabi-lld\backend\resources\views/emails/ticket-resolu.blade.php ENDPATH**/ ?>
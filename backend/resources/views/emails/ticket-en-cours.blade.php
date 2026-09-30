<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ticket Pris en Charge</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 620px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .header { background: #F58220; padding: 28px 32px; text-align: center; }
  .header img { height: 50px; margin-bottom: 12px; }
  .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
  .badge { display: inline-block; background: #fff; color: #F58220; border-radius: 20px; padding: 5px 18px; font-weight: 700; font-size: 13px; margin-top: 10px; }
  .body { padding: 32px; }
  .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
  .info-box { background: #FFF7F0; border-left: 4px solid #F58220; border-radius: 4px; padding: 18px 22px; margin-bottom: 24px; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
  .info-label { color: #888; font-weight: 600; min-width: 140px; }
  .info-value { color: #222; font-weight: 500; text-align: right; }
  .status-badge { background: #FFF3CD; color: #856404; border: 1px solid #FFEEBA; border-radius: 20px; padding: 3px 14px; font-size: 13px; font-weight: 700; }
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
    <span class="badge">🔄 TICKET PRIS EN CHARGE</span>
  </div>
  <div class="body">
    <p class="greeting">Bonjour <strong>{{ $ticket->utilisateur->nom }}</strong>,</p>
    <p style="font-size:15px;color:#555;">Votre ticket a été <strong>pris en charge</strong> par notre équipe technique. Vous serez informé dès que la résolution sera effectuée.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Référence ticket</span>
        <span class="info-value"><strong>#{{ $ticket->id_ticket }}</strong></span>
      </div>
      <div class="info-row">
        <span class="info-label">Objet</span>
        <span class="info-value">{{ $ticket->objet_ticket }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Catégorie</span>
        <span class="info-value">{{ $ticket->categorie->nom }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Priorité</span>
        <span class="info-value">{{ ucfirst($ticket->priorite) }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Statut</span>
        <span class="info-value"><span class="status-badge">En cours</span></span>
      </div>
      <div class="info-row">
        <span class="info-label">Date de création</span>
        <span class="info-value">{{ \Carbon\Carbon::parse($ticket->date_creation)->format('d/m/Y') }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date d'ouverture</span>
        <span class="info-value">{{ \Carbon\Carbon::parse($ticket->date_ouverture)->format('d/m/Y') }}</span>
      </div>
      @if($ticket->traiteur)
      <div class="info-row">
        <span class="info-label">Technicien assigné</span>
        <span class="info-value">{{ $ticket->traiteur->nom }}</span>
      </div>
      @endif
    </div>

    <div class="message">
      <strong>Description :</strong><br>
      {{ $ticket->description }}
    </div>

    <p style="font-size:13px;color:#888;">Pour tout renseignement complémentaire, veuillez contacter le support IT de Chaabi LLD.</p>
  </div>
  <div class="footer">
    <strong>Chaabi LLD</strong> — Système de Gestion des Tickets IT<br>
    Cet email est généré automatiquement, merci de ne pas y répondre.
  </div>
</div>
</body>
</html>

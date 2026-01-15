// Code.gs
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function inclure(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  return data.slice(1); // Skip header
}

function saveCommande(commande) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Commandes');
  const timestamp = new Date();
  const idCde = 'CDE-' + Utilities.formatDate(timestamp, 'GMT+1', 'yyyyMMdd-HHmmss-SSS');
  
  sheet.appendRow([
    idCde,
    commande.idClient || 'ANONYME',
    JSON.stringify(commande.details),
    commande.heureDispo,
    commande.paiement || 'A_SAISIR',
    'EN_ATTENTE',
    timestamp,
    commande.total
  ]);
  
  return idCde;
}

function saveClient(client) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Clients');
  const timestamp = new Date();
  const idClient = 'CLT-' + client.nom.charAt(0) + client.prenom.charAt(0) + 
                   Utilities.formatDate(timestamp, 'GMT+1', 'yyyyMMdd-HHmm');
  
  sheet.appendRow([idClient, client.nom, client.prenom, client.tel, client.email]);
  return idClient;
}

function saveSession(session) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Sessions');
  sheet.appendRow([session.debut, session.fin, session.mode, session.capacite, session.pas]);
}

function getNextSlot() {
  const commandes = getData('Commandes');
  const sessions = getData('Sessions');
  if (sessions.length === 0) return new Date(Date.now() + 20*60*1000); // +20min
  
  // Logique simple planning
  const lastSession = sessions[sessions.length-1];
  const debut = new Date(lastSession[0]);
  const pas = lastSession[4] || 15;
  return new Date(debut.getTime() + pas*60*1000);
}

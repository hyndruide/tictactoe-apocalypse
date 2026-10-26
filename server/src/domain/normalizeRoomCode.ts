/**
 * Normalise un code de salon saisi par un joueur sous format canonique "V-XXXX".
 * Tolérant aux majuscules/minuscules, espaces, omission de "V-", tiret manquant ou préfixe "VAULT-".
 */
export function normalizeRoomCode(rawCode: string): string {
  if (!rawCode || typeof rawCode !== 'string') {
    return '';
  }
  let code = rawCode.trim().toUpperCase().replace(/[\s_]+/g, '-');

  // Supprimer d'éventuels préfixes verbeux
  if (code.startsWith('VAULT-')) {
    code = code.replace('VAULT-', '');
  } else if (code.startsWith('VAULT')) {
    code = code.replace('VAULT', '');
  }

  // Supprimer préfixe V- ou V initial pour extraire le code brut
  if (code.startsWith('V-')) {
    code = code.slice(2);
  } else if (code.startsWith('V') && code.length >= 4) {
    code = code.slice(1);
  }

  // Nettoyer tout caractère parasite non alphanumérique
  code = code.replace(/[^A-Z0-9]/g, '');

  if (!code) {
    return '';
  }

  return `V-${code}`;
}

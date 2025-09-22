// assets/js/utils/share.js
// Versão compatível com chaves "curtas" e "verbosas" sem quebrar o que já funciona.
// - Aceita payloads do shareui.js (n/r/p/cov/h com o/s/c/f/i/l/x)
// - Aceita payloads verbosos (numEntradas/roundStep/promoOdd/coverages/...)
// - Mantém a geração do link encapsulada; se existir um criador externo, usa ele (não quebra seu fluxo atual).

export class ShareSystem {
  // ---------------------------
  // ARBIPRO
  // ---------------------------
  generateArbiProLink(data) {
    // aceitar ambos formatos (curto e verbo)
    const numHouses = data?.numHouses ?? data?.n ?? 2;
    const rounding  = data?.rounding  ?? data?.r ?? 0.01;

    const housesIn = Array.isArray(data?.houses) ? data.houses
                    : Array.isArray(data?.h)      ? data.h
                    : [];

    // Normaliza cada casa no formato "curto" esperado pelo consumidor do link
    const houses = housesIn.slice(0, numHouses).map((h) => ({
      // odd / stake / commission
      o: h?.o ?? h?.odd ?? '',
      s: h?.s ?? h?.stake ?? '',
      c: _nullishToNumberOrNull(h?.c ?? h?.commission),
      // flags e extras
      f: _toBool(h?.f ?? h?.freebet, false),
      i: _nullishToNumberOrNull(h?.i ?? h?.increase),
      l: _toBool(h?.l ?? h?.lay, false),
      x: _toBool(h?.x ?? h?.fixedStake, false),
    }));

    const config = { t: 'arbipro', n: numHouses, r: rounding, h: houses };
    return this.createShareableLink(config);
  }

  // ---------------------------
  // FREEPRO
  // ---------------------------
  generateFreeProLink(data) {
    // aceitar ambos formatos (curto e verbo)
    const n = data?.n ?? data?.numEntradas ?? 3;
    const r = data?.r ?? data?.roundStep   ?? 1.0;

    // Casa Promo (p)
    const pIn = data?.p ?? {
      o: data?.promoOdd ?? '',
      c: data?.promoComm ?? '',
      s: data?.promoStake ?? '',
      f: data?.freebetValue ?? '',
      e: data?.extractionRate ?? 70,
    };

    const p = {
      o: pIn?.o ?? data?.promoOdd ?? '',
      c: pIn?.c ?? data?.promoComm ?? '',
      s: pIn?.s ?? data?.promoStake ?? '',
      f: pIn?.f ?? data?.freebetValue ?? '',
      e: pIn?.e ?? data?.extractionRate ?? 70,
    };

    // Coberturas (cov / coverages)
    const covIn = Array.isArray(data?.cov) ? data.cov
                : Array.isArray(data?.coverages) ? data.coverages
                : [];

    const cov = covIn.map((c) => ({
      odd:  c?.odd ?? c?.o ?? '',
      comm: c?.comm ?? c?.c ?? '',
      lay:  _toBool(c?.lay ?? c?.l, false),
    }));

    const config = { t: 'freepro', n, r, p, cov };
    return this.createShareableLink(config);
  }

  // ---------------------------
  // CRIAÇÃO DO LINK (não-invasivo)
  // ---------------------------
  createShareableLink(config) {
    // 1) Se existir algum criador externo (para manter seu fluxo atual), use-o.
    //    - window.ShareCreateLink(config)   -> legado/projeto
    //    - this._externalCreateShareableLink(config) -> injetável
    try {
      if (typeof window !== 'undefined' && typeof window.ShareCreateLink === 'function') {
        return window.ShareCreateLink(config);
      }
      if (typeof this._externalCreateShareableLink === 'function') {
        return this._externalCreateShareableLink(config);
      }
    } catch (_) {
      // ignora e cai no fallback interno
    }

    // 2) Fallback interno: gera URL atual + parâmetro ?share=payload
    //    Mantemos tolerância a nomes já vistos: se já houver ?s= ou ?share=, preservamos a chave.
    const url = new URL(typeof window !== 'undefined' ? window.location.href : 'https://example.com/');
    const key = _detectShareKey(url.searchParams) ?? 'share';

    const encoded = _encodePayload(config);
    url.searchParams.set(key, encoded);

    // Remove fragment antigo de share, se houver (higiene)
    if (url.hash && /^#(s|share)=/i.test(url.hash.slice(1))) {
      url.hash = '';
    }
    return url.toString();
  }

  // ---------------------------
  // OPCIONAL: leitura/parse do payload (tolerante)
  // ---------------------------
  static readFromUrl(currentHref) {
    const url = new URL(currentHref || (typeof window !== 'undefined' ? window.location.href : 'https://example.com/'));
    const sp  = url.searchParams;
    const hash = (url.hash || '').replace(/^#/, '');

    // aceita ?share=... , ?s=... , #share=... , #s=...
    let raw = sp.get('share') || sp.get('s') || null;
    if (!raw && hash) {
      const parts = hash.split('=');
      if (parts.length === 2 && (parts[0] === 'share' || parts[0] === 's')) {
        raw = parts[1];
      }
    }
    if (!raw) return null;

    return _decodePayload(raw);
  }
}

/* -------------------------------------------
 * Helpers
 * -----------------------------------------*/

function _detectShareKey(params) {
  if (!params) return null;
  if (params.has('s')) return 's';
  if (params.has('share')) return 'share';
  return null;
}

function _encodePayload(obj) {
  // Gera duas camadas de tolerância:
  // 1) Tenta Base64URL(JSON) para ficar "limpo".
  // 2) Se der erro, cai para encodeURIComponent(JSON).
  try {
    const json = JSON.stringify(obj);
    const b64 = _toBase64Url(json);
    return `b64:${b64}`;
  } catch {
    try {
      return `j:${encodeURIComponent(JSON.stringify(obj))}`;
    } catch {
      // último recurso: string simples
      return `j:${encodeURIComponent(String(obj))}`;
    }
  }
}

function _decodePayload(raw) {
  // Aceita formatos:
  // - "b64:...." (Base64URL JSON)
  // - "j:%7B...%7D" (URI encoded JSON)
  // - cru (tenta adivinhar)
  let s = String(raw || '');

  // Tenta detectar prefixo
  if (s.startsWith('b64:')) {
    const body = s.slice(4);
    try {
      const json = _fromBase64Url(body);
      return JSON.parse(json);
    } catch {
      // continua tentando outros formatos
    }
  }
  if (s.startsWith('j:')) {
    const body = s.slice(2);
    try {
      const json = decodeURIComponent(body);
      return JSON.parse(json);
    } catch {
      // cai no heurístico
    }
  }

  // Heurística: se parecer base64url, tenta
  if (/^[A-Za-z0-9_\-]+$/.test(s)) {
    try {
      const json = _fromBase64Url(s);
      return JSON.parse(json);
    } catch {
      // ignora
    }
  }

  // Último tiro: tenta URI -> JSON
  try {
    const json = decodeURIComponent(s);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function _toBase64Url(str) {
  if (typeof btoa === 'function') {
    // btoa espera bytes latin1; normaliza para UTF-8
    const utf8 = unescape(encodeURIComponent(str));
    return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  // Node ou ambientes sem btoa
  return Buffer.from(str, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function _fromBase64Url(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 2 ? '==' : b64.length % 4 === 3 ? '=' : '';
  const full = b64 + pad;

  if (typeof atob === 'function') {
    const bin = atob(full);
    // reconverte de latin1 para UTF-8
    try {
      return decodeURIComponent(escape(bin));
    } catch {
      // se der erro, devolve direto
      return bin;
    }
  }
  // Node ou ambientes sem atob
  return Buffer.from(full, 'base64').toString('utf8');
}

function _toBool(v, fallback = false) {
  if (typeof v === 'boolean') return v;
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v == null) return fallback;
  // 1/0
  if (v === 1 || v === '1') return true;
  if (v === 0 || v === '0') return false;
  return Boolean(v);
}

function _nullishToNumberOrNull(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Export opcional para uso externo (ex.: testes)
export const ShareHelpers = {
  encode: _encodePayload,
  decode: _decodePayload,
  base64url: { to: _toBase64Url, from: _fromBase64Url },
};

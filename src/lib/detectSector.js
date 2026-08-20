// Shared utility — NO "use client" — safe to import in both server and client components

export function detectSector(category, name, forcedSector) {
  if (forcedSector) return forcedSector;
  const text = `${category || ''} ${name || ''}`.toLowerCase();

  if (
    text.includes('halı') || text.includes('hali') || text.includes('koltuk') ||
    text.includes('perde') || text.includes('yorgan') || text.includes('kuru temizleme')
  ) {
    return 'hali-yikama';
  }
  if (
    text.includes('oto') || text.includes('yıkama') || text.includes('yikama') ||
    text.includes('detailing') || text.includes('lastik') ||
    text.includes('araba') || text.includes('kaplama')
  ) {
    return 'oto-yikama';
  }
  if (
    text.includes('kuaför') || text.includes('kuafor') || text.includes('berber') ||
    text.includes('güzellik') || text.includes('guzellik') || text.includes('tırnak') ||
    text.includes('makyaj') || text.includes('lazer') ||
    text.includes('epilasyon') || text.includes('salon')
  ) {
    return 'kuafor';
  }
  if (
    text.includes('restoran') || text.includes('kafe') || text.includes('cafe') ||
    text.includes('kebap') || text.includes('döner') || text.includes('doner') ||
    text.includes('pizza') || text.includes('burger') || text.includes('lokanta') ||
    text.includes('fırın') || text.includes('firin') || text.includes('tatlı')
  ) {
    return 'restoran';
  }
  if (
    text.includes('tesisat') || text.includes('elektrik') || text.includes('kombi') ||
    text.includes('usta') || text.includes('tamir') || text.includes('klima') ||
    text.includes('servis') || text.includes('çilingir') || text.includes('cilingir') ||
    text.includes('boya') || text.includes('tadilat')
  ) {
    return 'teknik-servis';
  }
  return 'kurumsal';
}

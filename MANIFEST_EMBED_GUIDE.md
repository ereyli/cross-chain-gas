# Farcaster Mini Apps: Manifest vs Embed Guide

Bu rehber, GasUp projesinde Farcaster Mini Apps için doğru manifest ve embed kullanımını açıklar.

## Özet

[Farcaster Manifest vs Embed rehberine](https://miniapps.farcaster.xyz/docs/guides/manifest-vs-embed) göre:

- **Manifest** = Uygulamanızın kimliği ve konfigürasyonu (domain başına bir tane)
- **Embed** = Sosyal paylaşım için sayfa düzeyinde metadata (domain başına birçok tane)

## Ana Hatalar ve Düzeltmeler

### ❌ Yapılan Hatalar:
1. **Manifest yanlış yerde**: `public/manifest.json` ❌
2. **Embed eksik**: `fc:miniapp` meta tag'leri yoktu ❌
3. **Manifest yapısı yanlış**: Farcaster spec'e uygun değildi ❌

### ✅ Yapılan Düzeltmeler:
1. **Manifest doğru yerde**: `/.well-known/farcaster.json` ✅
2. **Embed eklendi**: `fc:miniapp` meta tag'leri eklendi ✅
3. **Manifest yapısı düzeltildi**: Farcaster spec'e uygun ✅

## Dosya Yapısı

```
public/
├── .well-known/
│   └── farcaster.json          # ✅ Manifest (doğru konum)
└── logos/
    └── ethereum-eth-logo.png   # App icon

app/
├── layout.tsx                  # ✅ Embed metadata (fc:miniapp tags)
└── page.tsx                    # Ana sayfa
```

## Manifest (`/.well-known/farcaster.json`)

### Amaç
- Uygulamanızın kimliğini tanımlar
- Domain doğrulaması sağlar
- App store listelerinde görünür
- Bildirimler için webhook URL'i
- Varsayılan launch davranışı

### İçerik
```json
{
  "version": "1.0.0",
  "name": "GasUp",
  "description": "Cross-chain gas top-up service for Farcaster users. Bridge ETH and tokens seamlessly between 12+ blockchain networks.",
  "icon": "https://cross-chain-gas.vercel.app/logos/ethereum-eth-logo.png",
  "homeUrl": "https://cross-chain-gas.vercel.app",
  "webhookUrl": "https://cross-chain-gas.vercel.app/api/webhook",
  "actions": [
    {
      "name": "Get Gas Quote",
      "path": "/",
      "description": "Get a cross-chain gas top-up quote",
      "icon": "https://cross-chain-gas.vercel.app/logos/ethereum-eth-logo.png"
    }
  ],
  "supportedChains": [
    "ethereum", "base", "arbitrum", "optimism", 
    "polygon", "linea", "sonic", "unichain", 
    "ink", "hyperevm", "abstract", "zora"
  ],
  "minSdkVersion": "0.1.0",
  "verification": {
    "domain": "cross-chain-gas.vercel.app"
  }
}
```

## Embed (Meta Tags)

### Amaç
- Sosyal paylaşım için zengin kartlar
- Feed'lerde etkileşimli kartlar
- Sayfa özel görüntü ve butonlar
- Keşfedilebilirlik

### İçerik (app/layout.tsx)
```typescript
export const metadata: Metadata = {
  // ... diğer metadata
  openGraph: {
    title: 'GasUp - Cross-Chain Gas Top-Up',
    description: 'Bridge ETH and tokens seamlessly between 12+ blockchain networks',
    images: ['https://cross-chain-gas.vercel.app/logos/ethereum-eth-logo.png'],
    url: 'https://cross-chain-gas.vercel.app',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GasUp - Cross-Chain Gas Top-Up',
    description: 'Bridge ETH and tokens seamlessly between 12+ blockchain networks',
    images: ['https://cross-chain-gas.vercel.app/logos/ethereum-eth-logo.png'],
  },
  other: {
    'fc:miniapp': 'GasUp',
    'fc:miniapp:version': '1.0.0',
    'fc:miniapp:image': 'https://cross-chain-gas.vercel.app/logos/ethereum-eth-logo.png',
    'fc:miniapp:button:1': 'Get Gas Quote',
    'fc:miniapp:button:1:action': 'https://cross-chain-gas.vercel.app/',
    'fc:miniapp:button:1:target': 'frame',
  },
};
```

## İkisinin Birlikte Çalışması

### Manifest Olmadan Embed:
- ✅ Sayfalar feed'lerde zengin kart olarak görünür
- ❌ Kullanıcılar app'i listelerine ekleyemez
- ❌ Bildirim gönderemezsiniz
- ❌ App store discovery'de görünmez

### Embed Olmadan Manifest:
- ✅ App Farcaster'a kayıtlı
- ✅ Kullanıcılar app'i ekleyebilir
- ❌ Sayfalar sosyal olarak paylaşılamaz
- ❌ Feed discovery kaybolur

### İkisi Birlikte:
- ✅ Tam Mini App deneyimi
- ✅ Sosyal paylaşım + app kayıt
- ✅ Keşfedilebilirlik + kullanılabilirlik
- ✅ Bildirimler + etkileşim

## En Yaygın Hata

**Embed'ler olmadan manifest oluşturmak.** Geliştiriciler genellikle sosyal paylaşım istedikleri için embed'lerle başlar ama manifest'i unutur. Bu, app'in Farcaster ile entegrasyonunu sınırlar.

**En iyi pratik**: Önce manifest'inizi kurun, sonra paylaşılabilir sayfalara embed ekleyin.

## Test Etme

### Manifest Test:
```bash
curl https://cross-chain-gas.vercel.app/.well-known/farcaster.json
```

### Embed Test:
- Sayfa kaynağını görüntüleyin
- `fc:miniapp` meta tag'lerini kontrol edin
- OpenGraph ve Twitter meta tag'lerini kontrol edin

## Deployment Notları

1. **HTTPS Gerekli**: Farcaster manifest ve embed'ler HTTPS gerektirir
2. **Domain Doğrulaması**: Manifest'teki domain ile gerçek domain eşleşmeli
3. **CORS Ayarları**: `/.well-known/` endpoint'i için CORS ayarları
4. **Cache Headers**: Manifest için uygun cache headers

## Sorun Giderme

### Manifest Bulunamıyor:
- Dosya `/.well-known/farcaster.json` konumunda mı?
- HTTPS kullanıyor musunuz?
- JSON formatı geçerli mi?

### Embed Çalışmıyor:
- Meta tag'ler HTML `<head>`'de mi?
- `fc:miniapp` property'leri doğru mu?
- OpenGraph ve Twitter meta tag'leri var mı?

### Build Hataları:
- Next.js App Router'da metadata'yı client component'te export etmeyin
- Layout'ta metadata export edin
- `use client` directive'i olan component'lerde metadata kullanmayın

## Kaynaklar

- [Farcaster Mini Apps Manifest vs Embed Guide](https://miniapps.farcaster.xyz/docs/guides/manifest-vs-embed)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [OpenGraph Protocol](https://ogp.me/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## Sonuç

Manifest ve embed'ler birlikte çalışarak GasUp'a tam Mini App deneyimi sağlar:

- **Manifest** = App'in pasaportu (kim olduğunuz)
- **Embed** = İçeriğin kartviziti (bu sayfa ne yapar)

Her ikisine de ihtiyacınız var ki Farcaster'da keşfedilebilir, paylaşılabilir ve tam entegre bir Mini App deneyimi oluşturun.

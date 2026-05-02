/**
 * Seed — popula APENAS criadoras (modelos) e seus planos.
 * Usuários reais (assinantes) serão criados via fluxo de cadastro.
 *
 * Fotos: Unsplash royalty-free, no clima do Privacy/OnlyFans BR
 * (bikini, lingerie tasteful, glamour, fitness model).
 *
 * Senha padrão das criadoras: "Fantastic@2026" (apenas para dev).
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Avatares (retratos sensuais / glamour / fashion)
const A = {
  // Brasileiras / latinas estilo
  badmi:        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
  camila:       'https://images.unsplash.com/photo-1622207074957-aabbf6dac28d?auto=format&fit=crop&w=800&q=80',
  olivia:       'https://images.unsplash.com/photo-1602080858428-57174f9431cf?auto=format&fit=crop&w=800&q=80',
  juju:         'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=800&q=80',
  melissa:      'https://images.unsplash.com/photo-1571516107011-0a31ab69a2cb?auto=format&fit=crop&w=800&q=80',
  preta:        'https://images.unsplash.com/photo-1602026321648-08a3ba83c5c8?auto=format&fit=crop&w=800&q=80',
  // Novas
  lili:         'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=800&q=80',
  ana:          'https://images.unsplash.com/photo-1565462900906-cf1a6d8f1edd?auto=format&fit=crop&w=800&q=80',
  manu:         'https://images.unsplash.com/photo-1592920720134-7b2ec6f30e13?auto=format&fit=crop&w=800&q=80',
  bruna:        'https://images.unsplash.com/photo-1551316679-9c6ae9dec224?auto=format&fit=crop&w=800&q=80',
  isabella:     'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?auto=format&fit=crop&w=800&q=80',
  gabriela:     'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
};

// Capas (fotos full-bleed, mais "pin-up", sensual)
const C = {
  bikiniBeach:  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80',
  bedroom:      'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=1600&q=80',
  pool:         'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=1600&q=80',
  studio:       'https://images.unsplash.com/photo-1551316679-9c6ae9dec224?auto=format&fit=crop&w=1600&q=80',
  fitness:      'https://images.unsplash.com/photo-1602080858428-57174f9431cf?auto=format&fit=crop&w=1600&q=80',
  lingerie:     'https://images.unsplash.com/photo-1565462900906-cf1a6d8f1edd?auto=format&fit=crop&w=1600&q=80',
  redLight:     'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?auto=format&fit=crop&w=1600&q=80',
  glamour:      'https://images.unsplash.com/photo-1622207074957-aabbf6dac28d?auto=format&fit=crop&w=1600&q=80',
  bedroom2:     'https://images.unsplash.com/photo-1592920720134-7b2ec6f30e13?auto=format&fit=crop&w=1600&q=80',
  city:         'https://images.unsplash.com/photo-1602026321648-08a3ba83c5c8?auto=format&fit=crop&w=1600&q=80',
  beach2:       'https://images.unsplash.com/photo-1571516107011-0a31ab69a2cb?auto=format&fit=crop&w=1600&q=80',
  satin:        'https://images.unsplash.com/photo-1610312678566-c8adcae4c9b1?auto=format&fit=crop&w=1600&q=80',
};

// Posts (fotos pra timeline)
const P = {
  pool1:        'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?auto=format&fit=crop&w=800&q=80',
  pool2:        'https://images.unsplash.com/photo-1623239010143-f1a89e9aae21?auto=format&fit=crop&w=800&q=80',
  bedroom1:     'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=800&q=80',
  bedroom2:     'https://images.unsplash.com/photo-1610312678566-c8adcae4c9b1?auto=format&fit=crop&w=800&q=80',
  bikini1:      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
  bikini2:      'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=800&q=80',
  fitness1:     'https://images.unsplash.com/photo-1602080858428-57174f9431cf?auto=format&fit=crop&w=800&q=80',
  fitness2:     'https://images.unsplash.com/photo-1583500178690-f7fd39158bc0?auto=format&fit=crop&w=800&q=80',
  glamour1:     'https://images.unsplash.com/photo-1622207074957-aabbf6dac28d?auto=format&fit=crop&w=800&q=80',
  glamour2:     'https://images.unsplash.com/photo-1602026321648-08a3ba83c5c8?auto=format&fit=crop&w=800&q=80',
  red1:         'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?auto=format&fit=crop&w=800&q=80',
  fashion1:     'https://images.unsplash.com/photo-1571516107011-0a31ab69a2cb?auto=format&fit=crop&w=800&q=80',
};

const creators = [
  {
    username: 'badmi', email: 'badmi@creator.local',
    displayName: 'BAD MI | MC MIRELLA',
    avatar: A.badmi, cover: C.bedroom,
    bio: 'PUTA CHEFE NÉ BEBÊ? A 01 🏆 Conteúdo exclusivo, vídeos diários, chat liberado pra todos meus assinantes! NOVINHA MAIS SAFADA DO BRASIL 🔥',
    monthlyPrice: 50.00,
    socialLinks: { twitter: 'badmi', tiktok: 'badmi' },
    stats: { photos: 373, videos: 391, locked: 180, likes: 387700, subscribers: 21230 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 50.00,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 142.50, discountPercent: 5,  isPromo: true,  displayOrder: 2 },
      { name: '6 meses', intervalMonths: 6, price: 252.00, discountPercent: 16, isPromo: true,  displayOrder: 3 },
    ],
    posts: [
      { caption: 'Foto nova no quarto 🔥 quem quer ver tudo?', img: P.bedroom1, locked: true,  ppv: 19.90 },
      { caption: 'Bom dia gostosos 😈',                          img: P.glamour1, locked: false, ppv: null },
      { caption: 'PPV chegando, vídeo de 12 min liberado',      img: P.bedroom2, locked: true,  ppv: 39.90 },
      { caption: 'Treinando pra ficar ainda mais gostosa 💪',  img: P.fitness1, locked: false, ppv: null },
      { caption: 'Ensaio de hoje saiu DEMAIS 🥵',                img: P.glamour2, locked: true,  ppv: null },
      { caption: 'Quem manda dm ganha foto extra 😘',           img: P.bikini1,  locked: false, ppv: null },
    ],
  },
  {
    username: 'camilabecker', email: 'camila@creator.local',
    displayName: 'Camila Becker',
    avatar: A.camila, cover: C.glamour,
    bio: 'Bem-vindos ao meu universo ✨ Conteúdo exclusivo, ensaios sensuais e bastidores. Vídeos liberados toda semana! 💋',
    monthlyPrice: 39.90,
    socialLinks: { twitter: 'camilabecker', tiktok: 'camilabecker' },
    stats: { photos: 412, videos: 187, locked: 95, likes: 142800, subscribers: 12842 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 39.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 113.72, discountPercent: 5,  isPromo: true,  displayOrder: 2 },
      { name: '6 meses', intervalMonths: 6, price: 201.10, discountPercent: 16, isPromo: true,  displayOrder: 3 },
    ],
    posts: [
      { caption: 'Novo ensaio na piscina 💦',               img: P.pool1,    locked: false, ppv: null },
      { caption: 'Vídeo VIP liberado pra assinantes',       img: P.bedroom2, locked: true,  ppv: null },
      { caption: 'Look de hoje, gostaram? 💃',              img: P.fashion1, locked: false, ppv: null },
      { caption: 'Tem mais foto desse ensaio nas mensagens', img: P.glamour1, locked: true,  ppv: 24.90 },
    ],
  },
  {
    username: 'oliviabianchivip', email: 'olivia@creator.local',
    displayName: 'OLÍVIA BIANCHI',
    avatar: A.olivia, cover: C.fitness,
    bio: 'Modelo fitness e empresária 💪 Compartilho rotina, treinos, dietas e conteúdo premium toda semana. Atendo dúvidas no chat!',
    monthlyPrice: 49.90,
    socialLinks: { twitter: 'oliviabianchi', instagram: 'oliviabianchi' },
    stats: { photos: 287, videos: 94, locked: 110, likes: 89500, subscribers: 9851 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 49.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 134.73, discountPercent: 10, isPromo: true,  displayOrder: 2 },
      { name: '12 meses', intervalMonths: 12, price: 358.92, discountPercent: 40, isPromo: true, displayOrder: 3 },
    ],
    posts: [
      { caption: 'Treino de glúteo pesado hoje 🍑',        img: P.fitness1, locked: false, ppv: null },
      { caption: 'After workout 💦',                        img: P.fitness2, locked: true,  ppv: null },
      { caption: 'Bastidores do shoot fitness',            img: P.glamour2, locked: false, ppv: null },
      { caption: 'Pacote de fotos novo no PPV',            img: P.bikini1,  locked: true,  ppv: 29.90 },
    ],
  },
  {
    username: 'jujufuracao', email: 'juju@creator.local',
    displayName: 'Juju Furacão',
    avatar: A.juju, cover: C.pool,
    bio: 'Praia, piscina e muita energia 🌊🔥 Quer ver eu na água? Tem ensaio molhado novo toda semana 😘',
    monthlyPrice: 34.90,
    socialLinks: { instagram: 'jujufuracao' },
    stats: { photos: 198, videos: 67, locked: 45, likes: 56200, subscribers: 8742 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 34.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 89.42,  discountPercent: 15, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: 'Tarde de piscina hoje 💦',                img: P.pool1, locked: false, ppv: null },
      { caption: 'Vídeo molhadinha 😈 só pra assinantes',   img: P.pool2, locked: true,  ppv: null },
      { caption: 'Bikini novo, gostaram?',                  img: P.bikini1, locked: false, ppv: null },
    ],
  },
  {
    username: 'melissamont', email: 'melissa@creator.local',
    displayName: 'melissa_montenegro',
    avatar: A.melissa, cover: C.beach2,
    bio: 'Conteúdo sensual autoral 💋 Posto novidades 3x por semana, ensaios profissionais, atendimento personalizado no chat.',
    monthlyPrice: 24.90,
    socialLinks: { tiktok: 'melissamont' },
    stats: { photos: 142, videos: 38, locked: 22, likes: 28400, subscribers: 5640 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 24.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 67.20, discountPercent: 10, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: 'Praia hoje 🌅 fotos lindas!',             img: P.bikini1, locked: false, ppv: null },
      { caption: 'Ensaio íntimo, libera só nas DMs',        img: P.bedroom1, locked: true,  ppv: 19.90 },
    ],
  },
  {
    username: 'pretapremium', email: 'preta@creator.local',
    displayName: 'preta_premium',
    avatar: A.preta, cover: C.city,
    bio: 'Vivo um lifestyle entre viagens, autocuidado e ensaios 💎 Aqui rola exclusivo de tudo. Vem comigo brilhar 🔥',
    monthlyPrice: 39.90,
    socialLinks: { instagram: 'pretapremium', twitter: 'pretapremium' },
    stats: { photos: 380, videos: 121, locked: 70, likes: 198400, subscribers: 14210 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 39.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 107.73, discountPercent: 10, isPromo: true,  displayOrder: 2 },
      { name: '6 meses', intervalMonths: 6, price: 191.52, discountPercent: 20, isPromo: true,  displayOrder: 3 },
    ],
    posts: [
      { caption: 'Viagem nova 🌴 ensaios na praia chegando',  img: P.bikini2, locked: false, ppv: null },
      { caption: 'Vídeo VIP gravado em hotel 5 estrelas',     img: P.bedroom2, locked: true, ppv: null },
      { caption: 'Bom dia gostosos 💋',                        img: P.glamour1, locked: false, ppv: null },
      { caption: 'PPV exclusivo + chamada de vídeo',           img: P.glamour2, locked: true, ppv: 49.90 },
    ],
  },
  // ============ NOVAS ============
  {
    username: 'lilipremium', email: 'lili@creator.local',
    displayName: 'Lili Premium',
    avatar: A.lili, cover: C.lingerie,
    bio: 'Loira do brasil 🌟 Conteúdo de lingerie, boudoir e ensaios fine. Mando foto extra pra quem manda DM 💌',
    monthlyPrice: 44.90,
    socialLinks: { twitter: 'lilipremium', instagram: 'lilipremium' },
    stats: { photos: 256, videos: 78, locked: 60, likes: 132500, subscribers: 11450 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 44.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 121.23, discountPercent: 10, isPromo: true,  displayOrder: 2 },
      { name: '6 meses', intervalMonths: 6, price: 215.52, discountPercent: 20, isPromo: true,  displayOrder: 3 },
    ],
    posts: [
      { caption: 'Conjunto novo de lingerie chegando 💋',     img: P.bedroom1, locked: false, ppv: null },
      { caption: 'Ensaio boudoir VIP — só pra assinantes',     img: P.bedroom2, locked: true, ppv: null },
      { caption: 'PPV: pacote 30 fotos + vídeo 8 min',         img: P.red1,    locked: true, ppv: 44.90 },
    ],
  },
  {
    username: 'anaclaudia', email: 'ana@creator.local',
    displayName: 'Ana Cláudia 🔥',
    avatar: A.ana, cover: C.satin,
    bio: 'Morena do RJ 🌺 Conteúdo dedicado, chamada de vídeo personalizada, fotos e vídeos novos toda semana 💕',
    monthlyPrice: 29.90,
    socialLinks: { instagram: 'anaclaudiavip', tiktok: 'anaclaudiaof' },
    stats: { photos: 167, videos: 54, locked: 35, likes: 73200, subscribers: 6820 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 29.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 76.24, discountPercent: 15, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: 'Foto de hoje, amei o ensaio 💕',  img: P.bedroom1, locked: false, ppv: null },
      { caption: 'Chamada de vídeo aberta, vem',     img: P.glamour1, locked: false, ppv: null },
      { caption: 'PPV liberado, 25 fotos quentes',   img: P.red1,    locked: true,  ppv: 24.90 },
    ],
  },
  {
    username: 'manumiranda', email: 'manu@creator.local',
    displayName: 'Manu Miranda',
    avatar: A.manu, cover: C.bedroom2,
    bio: 'Novinha de SP 💋 Atendendo dms personalizadas, vídeos exclusivos toda semana. Promo nova chegando 🔥',
    monthlyPrice: 19.90,
    socialLinks: { twitter: 'manumirandaof' },
    stats: { photos: 89, videos: 23, locked: 15, likes: 31700, subscribers: 3210 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 19.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 47.76, discountPercent: 20, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: 'Bem vindos ao meu cantinho 💕',  img: P.bedroom2, locked: false, ppv: null },
      { caption: 'Foto de calcinha pra vocês 😘',  img: P.bedroom1, locked: true,  ppv: 14.90 },
    ],
  },
  {
    username: 'brunaragazza', email: 'bruna@creator.local',
    displayName: 'Bruna Ragazza',
    avatar: A.bruna, cover: C.studio,
    bio: 'Modelo fashion 📸 Editoriais, ensaios profissionais e bastidores. Tudo o que não vai pro Instagram tá aqui 💄',
    monthlyPrice: 59.90,
    socialLinks: { instagram: 'brunaragazza', twitter: 'brunaragazza' },
    stats: { photos: 421, videos: 156, locked: 90, likes: 245100, subscribers: 18760 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 59.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 152.74, discountPercent: 15, isPromo: true,  displayOrder: 2 },
      { name: '6 meses', intervalMonths: 6, price: 287.52, discountPercent: 20, isPromo: true,  displayOrder: 3 },
    ],
    posts: [
      { caption: 'Editorial novo da semana ✨', img: P.fashion1, locked: false, ppv: null },
      { caption: 'Backstage do shoot 🎬',      img: P.glamour2, locked: true,  ppv: null },
      { caption: 'Pacote VIP, 50 fotos high-end', img: P.bedroom1, locked: true, ppv: 79.90 },
    ],
  },
  {
    username: 'isabellacavalo', email: 'isabella@creator.local',
    displayName: 'Isabella Cavalo',
    avatar: A.isabella, cover: C.redLight,
    bio: 'Ruiva de Floripa 🦊 Conteúdo ousado, lingerie vermelha e ensaios em hotel. Chama no chat 💌',
    monthlyPrice: 34.90,
    socialLinks: { tiktok: 'isabellacavalo', instagram: 'isabellacavalo' },
    stats: { photos: 198, videos: 67, locked: 50, likes: 95400, subscribers: 7890 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 34.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 89.42, discountPercent: 15, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: 'Lingerie vermelha do amor 💋',   img: P.red1,     locked: false, ppv: null },
      { caption: 'Ensaio em hotel 5⭐ liberado',   img: P.bedroom1, locked: true,  ppv: null },
      { caption: 'PPV gostoso de R$ 24,90',        img: P.bedroom2, locked: true,  ppv: 24.90 },
    ],
  },
  {
    username: 'gabrielatavares', email: 'gabriela@creator.local',
    displayName: 'Gabriela Tavares',
    avatar: A.gabriela, cover: C.bikiniBeach,
    bio: 'Praia, sol, biquíni e muita disposição 🌊☀️ Atendo personalizado no chat e mando foto extra de presente!',
    monthlyPrice: 27.90,
    socialLinks: { instagram: 'gabitavares' },
    stats: { photos: 234, videos: 81, locked: 40, likes: 112800, subscribers: 9430 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 27.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 75.33, discountPercent: 10, isPromo: true,  displayOrder: 2 },
      { name: '6 meses', intervalMonths: 6, price: 133.92, discountPercent: 20, isPromo: true, displayOrder: 3 },
    ],
    posts: [
      { caption: 'Praia paradisíaca de hoje 🌴',  img: P.bikini1, locked: false, ppv: null },
      { caption: 'Vídeo da praia liberado',       img: P.bikini2, locked: true,  ppv: null },
      { caption: 'Foto de biquíni novo 👙',       img: P.pool1,   locked: false, ppv: null },
    ],
  },
];

async function main() {
  console.log('🌱 Iniciando seed...');

  const passwordHash = await bcrypt.hash('Fantastic@2026', 12);

  for (const c of creators) {
    const user = await prisma.user.upsert({
      where: { username: c.username },
      update: {
        profilePicture: c.avatar,
        bio: c.bio,
        isVerified: true,
        isAgeVerified: true,
      },
      create: {
        email:           c.email,
        username:        c.username,
        passwordHash,
        role:            'CREATOR',
        profilePicture:  c.avatar,
        bio:             c.bio,
        isVerified:      true,
        isAgeVerified:   true,
      },
    });

    const profile = await prisma.creatorProfile.upsert({
      where: { userId: user.id },
      update: {
        displayName:      c.displayName,
        coverImage:       c.cover,
        bio:              c.bio,
        subscriptionPrice: c.monthlyPrice,
        totalPhotos:      c.stats.photos,
        totalVideos:      c.stats.videos,
        totalLocked:      c.stats.locked,
        totalLikes:       c.stats.likes,
        totalSubscribers: c.stats.subscribers,
        socialLinks:      JSON.stringify(c.socialLinks),
      },
      create: {
        userId:           user.id,
        displayName:      c.displayName,
        coverImage:       c.cover,
        bio:              c.bio,
        subscriptionPrice: c.monthlyPrice,
        totalPhotos:      c.stats.photos,
        totalVideos:      c.stats.videos,
        totalLocked:      c.stats.locked,
        totalLikes:       c.stats.likes,
        totalSubscribers: c.stats.subscribers,
        socialLinks:      JSON.stringify(c.socialLinks),
      },
    });

    // Limpa planos antigos e recria
    await prisma.subscriptionPlan.deleteMany({ where: { creatorProfileId: profile.id } });
    await prisma.subscriptionPlan.createMany({
      data: c.plans.map((p) => ({
        creatorProfileId: profile.id,
        name:             p.name,
        intervalMonths:   p.intervalMonths,
        price:            p.price,
        discountPercent:  p.discountPercent,
        isPromo:          p.isPromo,
        isActive:         true,
        displayOrder:     p.displayOrder,
      })),
    });

    // Refaz posts (apaga antigos e recria)
    await prisma.post.deleteMany({ where: { creatorId: user.id } });
    if (c.posts && c.posts.length > 0) {
      for (const [idx, s] of c.posts.entries()) {
        await prisma.post.create({
          data: {
            creatorId:    user.id,
            type:         'PHOTO',
            caption:      s.caption,
            imageUrl:     s.img,
            thumbnailUrl: s.img,
            isLocked:     s.locked,
            ppvPrice:     s.ppv,
            publishedAt:  new Date(Date.now() - idx * 1000 * 60 * 60 * 4),
            likeCount:    Math.floor(Math.random() * 1500) + 200,
            commentCount: Math.floor(Math.random() * 80) + 10,
          },
        });
      }
    }

    console.log(`  ✓ @${c.username.padEnd(20)} ${c.displayName} (${c.posts?.length ?? 0} posts)`);
  }

  console.log(`\n✅ Seed concluído. ${creators.length} criadoras criadas.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => void prisma.$disconnect());

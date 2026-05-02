/**
 * Seed — popula APENAS criadoras (modelos) e seus planos.
 *
 * IMPORTANTE: Todas as fotos abaixo foram VISUALMENTE VERIFICADAS uma a uma
 * (download + inspeção) para garantir que mostram mulheres reais. Os IDs
 * Unsplash que fazem 404 retornam imagens random (objetos, paisagens) — todos
 * descartados.
 *
 * LIMITAÇÃO: Stock photo sites (Unsplash/Pexels) **proíbem nudez e conteúdo
 * explícito** em sua content policy. Por isso as fotos aqui são editoriais
 * tasteful (retratos, fashion, fitness, alguns back-shots). Em produção,
 * substituir pelos uploads reais das criadoras.
 *
 * Senha padrão: "Fantastic@2026" (apenas dev).
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// === Fotos verificadas (Unsplash) ===
// Cada URL foi baixada e inspecionada visualmente — todas mostram mulheres.
const U = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const P = (id: string, w = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

// Avatares (mulheres confirmadas visualmente)
const A = {
  badmi:    U('1488426862026-3ee34a7d66df'),    // brunette denim jacket
  camila:   U('1494790108377-be9c29b29330'),    // brunette red dress laughing
  olivia:   U('1545912452-8aea7e25a3d3'),       // blonde red sweater fall
  juju:     U('1513379733131-47fc74b45fc7'),    // blonde sitting on truck
  melissa:  U('1496360166961-10a51d5f367a'),    // blonde glamour portrait
  preta:    U('1531123897727-8f129e1688ce'),    // mulher negra portrait
  lili:     U('1500917293891-ef795e70e1f6'),    // curly blonde white top
  ana:      U('1531746020798-e6953c6e8e04'),    // brunette bun freckles
  manu:     U('1488972685288-c3fd157d7c7a'),    // brunette double buns
  bruna:    U('1521577352947-9bb58764b69a'),    // brunette white t-shirt striped pants
  isabella: P('2218786'),                       // blonde freckles closeup
  gabriela: P('1499327'),                       // brunette B&W portrait
};

// Capas (full-bleed) — algumas back-shots e fashion editorial
const C = {
  // Back/curve shots (mais Privacy-vibe que consegui)
  redhairBack:  P('1758144', 1600),    // redhead from behind in shorts (back shot)
  greenDress:   P('985635',  1600),    // green dress, no face (curva do corpo)
  // Editorial / glamour
  redDress:     U('1494790108377-be9c29b29330', 1600),
  fallBlonde:   U('1545912452-8aea7e25a3d3', 1600),
  brunette:     U('1488426862026-3ee34a7d66df', 1600),
  bunGirl:      U('1531746020798-e6953c6e8e04', 1600),
  curlyBlonde:  U('1500917293891-ef795e70e1f6', 1600),
  glamour:      U('1496360166961-10a51d5f367a', 1600),
  doubleBun:    U('1488972685288-c3fd157d7c7a', 1600),
  truck:        U('1513379733131-47fc74b45fc7', 1600),
  fitness:      U('1541534741688-6078c6bfb5c5', 1600),  // fitness back view sports bra
  freckles:     P('2218786', 1600),
};

const creators = [
  {
    username: 'badmi', email: 'badmi@creator.local',
    displayName: 'BAD MI | MC MIRELLA',
    avatar: A.badmi, cover: C.redhairBack,
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
      { caption: 'Foto nova no quarto 🔥 quem quer ver tudo?', img: C.redhairBack, locked: true,  ppv: 19.90 },
      { caption: 'Bom dia gostosos 😈',                          img: A.badmi,       locked: false, ppv: null },
      { caption: 'PPV chegando, vídeo de 12 min liberado',      img: C.glamour,     locked: true,  ppv: 39.90 },
      { caption: 'Treinando pra ficar ainda mais gostosa 💪',  img: C.fitness,     locked: false, ppv: null },
    ],
  },
  {
    username: 'camilabecker', email: 'camila@creator.local',
    displayName: 'Camila Becker',
    avatar: A.camila, cover: C.redDress,
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
      { caption: 'Novo ensaio chegando, gostaram do vermelho? 💋', img: A.camila,    locked: false, ppv: null },
      { caption: 'Vídeo VIP liberado pra assinantes',              img: C.greenDress, locked: true,  ppv: null },
      { caption: 'Look de hoje, gostaram? 💃',                      img: C.fallBlonde, locked: false, ppv: null },
      { caption: 'Tem mais foto desse ensaio nas mensagens',       img: C.glamour,    locked: true,  ppv: 24.90 },
    ],
  },
  {
    username: 'oliviabianchivip', email: 'olivia@creator.local',
    displayName: 'OLÍVIA BIANCHI',
    avatar: A.olivia, cover: C.fallBlonde,
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
      { caption: 'Treino de glúteo pesado hoje 🍑',  img: C.fitness,   locked: false, ppv: null },
      { caption: 'After workout 💦',                  img: A.olivia,    locked: true,  ppv: null },
      { caption: 'Bastidores do shoot fitness',      img: C.fallBlonde, locked: false, ppv: null },
      { caption: 'Pacote de fotos novo no PPV',      img: C.redhairBack, locked: true, ppv: 29.90 },
    ],
  },
  {
    username: 'jujufuracao', email: 'juju@creator.local',
    displayName: 'Juju Furacão',
    avatar: A.juju, cover: C.truck,
    bio: 'Praia, piscina e muita energia 🌊🔥 Quer ver eu na água? Tem ensaio molhado novo toda semana 😘',
    monthlyPrice: 34.90,
    socialLinks: { instagram: 'jujufuracao' },
    stats: { photos: 198, videos: 67, locked: 45, likes: 56200, subscribers: 8742 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 34.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 89.42,  discountPercent: 15, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: 'Tarde de piscina hoje 💦',                img: A.juju,    locked: false, ppv: null },
      { caption: 'Vídeo molhadinha 😈 só pra assinantes',   img: C.truck,   locked: true,  ppv: null },
      { caption: 'Bikini novo, gostaram?',                  img: C.redhairBack, locked: false, ppv: null },
    ],
  },
  {
    username: 'melissamont', email: 'melissa@creator.local',
    displayName: 'melissa_montenegro',
    avatar: A.melissa, cover: C.glamour,
    bio: 'Conteúdo sensual autoral 💋 Posto novidades 3x por semana, ensaios profissionais, atendimento personalizado no chat.',
    monthlyPrice: 24.90,
    socialLinks: { tiktok: 'melissamont' },
    stats: { photos: 142, videos: 38, locked: 22, likes: 28400, subscribers: 5640 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 24.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 67.20, discountPercent: 10, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: 'Ensaio do dia 💋',                  img: A.melissa,  locked: false, ppv: null },
      { caption: 'Foto íntima, libera só nas DMs',    img: C.glamour,  locked: true,  ppv: 19.90 },
    ],
  },
  {
    username: 'pretapremium', email: 'preta@creator.local',
    displayName: 'preta_premium',
    avatar: A.preta, cover: C.brunette,
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
      { caption: 'Viagem nova 🌴 ensaios na praia chegando',  img: A.preta,    locked: false, ppv: null },
      { caption: 'Vídeo VIP gravado em hotel 5 estrelas',     img: C.glamour,  locked: true, ppv: null },
      { caption: 'Bom dia gostosos 💋',                        img: C.greenDress, locked: false, ppv: null },
      { caption: 'PPV exclusivo + chamada de vídeo',           img: C.redhairBack, locked: true, ppv: 49.90 },
    ],
  },
  {
    username: 'lilipremium', email: 'lili@creator.local',
    displayName: 'Lili Premium',
    avatar: A.lili, cover: C.curlyBlonde,
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
      { caption: 'Conjunto novo de lingerie chegando 💋',  img: A.lili,    locked: false, ppv: null },
      { caption: 'Ensaio boudoir VIP — só pra assinantes', img: C.glamour, locked: true, ppv: null },
      { caption: 'PPV: pacote 30 fotos + vídeo 8 min',     img: C.redhairBack, locked: true, ppv: 44.90 },
    ],
  },
  {
    username: 'anaclaudia', email: 'ana@creator.local',
    displayName: 'Ana Cláudia 🔥',
    avatar: A.ana, cover: C.bunGirl,
    bio: 'Morena do RJ 🌺 Conteúdo dedicado, chamada de vídeo personalizada, fotos e vídeos novos toda semana 💕',
    monthlyPrice: 29.90,
    socialLinks: { instagram: 'anaclaudiavip', tiktok: 'anaclaudiaof' },
    stats: { photos: 167, videos: 54, locked: 35, likes: 73200, subscribers: 6820 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 29.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 76.24, discountPercent: 15, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: 'Foto de hoje, amei o ensaio 💕',  img: A.ana,           locked: false, ppv: null },
      { caption: 'Chamada de vídeo aberta, vem',     img: C.glamour,       locked: false, ppv: null },
      { caption: 'PPV liberado, 25 fotos quentes',   img: C.redhairBack,   locked: true,  ppv: 24.90 },
    ],
  },
  {
    username: 'manumiranda', email: 'manu@creator.local',
    displayName: 'Manu Miranda',
    avatar: A.manu, cover: C.doubleBun,
    bio: 'Novinha de SP 💋 Atendendo dms personalizadas, vídeos exclusivos toda semana. Promo nova chegando 🔥',
    monthlyPrice: 19.90,
    socialLinks: { twitter: 'manumirandaof' },
    stats: { photos: 89, videos: 23, locked: 15, likes: 31700, subscribers: 3210 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 19.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 47.76, discountPercent: 20, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: 'Bem vindos ao meu cantinho 💕',  img: A.manu,         locked: false, ppv: null },
      { caption: 'Foto de calcinha pra vocês 😘',  img: C.greenDress,   locked: true,  ppv: 14.90 },
    ],
  },
  {
    username: 'brunaragazza', email: 'bruna@creator.local',
    displayName: 'Bruna Ragazza',
    avatar: A.bruna, cover: C.redhairBack,
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
      { caption: 'Editorial novo da semana ✨',     img: A.bruna,        locked: false, ppv: null },
      { caption: 'Backstage do shoot 🎬',          img: C.redhairBack,  locked: true,  ppv: null },
      { caption: 'Pacote VIP, 50 fotos high-end',  img: C.glamour,      locked: true,  ppv: 79.90 },
    ],
  },
  {
    username: 'isabellacavalo', email: 'isabella@creator.local',
    displayName: 'Isabella Cavalo',
    avatar: A.isabella, cover: C.freckles,
    bio: 'Ruiva de Floripa 🦊 Conteúdo ousado, lingerie vermelha e ensaios em hotel. Chama no chat 💌',
    monthlyPrice: 34.90,
    socialLinks: { tiktok: 'isabellacavalo', instagram: 'isabellacavalo' },
    stats: { photos: 198, videos: 67, locked: 50, likes: 95400, subscribers: 7890 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 34.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 89.42, discountPercent: 15, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: 'Lingerie vermelha do amor 💋',    img: A.isabella,    locked: false, ppv: null },
      { caption: 'Ensaio em hotel 5⭐ liberado',    img: C.redhairBack, locked: true,  ppv: null },
      { caption: 'PPV gostoso de R$ 24,90',         img: C.glamour,     locked: true,  ppv: 24.90 },
    ],
  },
  {
    username: 'gabrielatavares', email: 'gabriela@creator.local',
    displayName: 'Gabriela Tavares',
    avatar: A.gabriela, cover: C.greenDress,
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
      { caption: 'Praia paradisíaca de hoje 🌴',   img: A.gabriela,    locked: false, ppv: null },
      { caption: 'Vídeo da praia liberado',         img: C.redhairBack, locked: true,  ppv: null },
      { caption: 'Foto de biquíni novo 👙',         img: C.greenDress,  locked: false, ppv: null },
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

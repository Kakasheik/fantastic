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
      { caption: '🔥 PPV liberado: vídeo 18 min completo, sem censura', img: C.redhairBack, locked: true, ppv: 79.90 },
      { caption: '💋 Pacote 50 fotos hot — só pra quem assina',          img: C.glamour,     locked: true, ppv: null },
      { caption: '😈 Live privada amanhã às 23h — chama no DM',           img: A.badmi,       locked: true, ppv: 99.90 },
      { caption: '🍑 Vídeo novo gravado pelada, conteúdo +18',           img: C.fitness,     locked: true, ppv: 49.90 },
    ],
  },
  {
    username: 'camilabecker', email: 'camila@creator.local',
    displayName: 'Camila Becker',
    avatar: A.camila, cover: C.redDress,
    bio: 'Bem-vindos ao meu universo +18 ✨ Conteúdo explícito, ensaios sem censura, vídeos hot toda semana 💋',
    monthlyPrice: 39.90,
    socialLinks: { twitter: 'camilabecker', tiktok: 'camilabecker' },
    stats: { photos: 412, videos: 187, locked: 95, likes: 142800, subscribers: 12842 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 39.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 113.72, discountPercent: 5,  isPromo: true,  displayOrder: 2 },
      { name: '6 meses', intervalMonths: 6, price: 201.10, discountPercent: 16, isPromo: true,  displayOrder: 3 },
    ],
    posts: [
      { caption: '💋 Ensaio sem censura — assine pra ver completo',  img: A.camila,    locked: true, ppv: null },
      { caption: '🔥 Vídeo VIP de 15 min liberado pra assinantes',   img: C.greenDress, locked: true, ppv: null },
      { caption: '😘 PPV: pacote 30 fotos + 2 vídeos curtinhos',     img: C.fallBlonde, locked: true, ppv: 39.90 },
      { caption: '🥵 Conteúdo explícito da semana — chama no DM',     img: C.glamour,    locked: true, ppv: 24.90 },
    ],
  },
  {
    username: 'oliviabianchivip', email: 'olivia@creator.local',
    displayName: 'OLÍVIA BIANCHI',
    avatar: A.olivia, cover: C.fallBlonde,
    bio: 'Modelo fitness +18 💪🔥 Conteúdo de pré-treino, pós-treino e bastidores hot. Atendo personalizado no chat!',
    monthlyPrice: 49.90,
    socialLinks: { twitter: 'oliviabianchi', instagram: 'oliviabianchi' },
    stats: { photos: 287, videos: 94, locked: 110, likes: 89500, subscribers: 9851 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 49.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 134.73, discountPercent: 10, isPromo: true,  displayOrder: 2 },
      { name: '12 meses', intervalMonths: 12, price: 358.92, discountPercent: 40, isPromo: true, displayOrder: 3 },
    ],
    posts: [
      { caption: '🍑 Treino de glúteo nu — vídeo 12 min liberado',  img: C.fitness,     locked: true, ppv: null },
      { caption: '💦 After workout sem roupa — só assinantes',      img: A.olivia,      locked: true, ppv: null },
      { caption: '🔥 Bastidores explícitos do shoot fitness',        img: C.fallBlonde,  locked: true, ppv: 39.90 },
      { caption: '😈 Pacote VIP +18 com 40 fotos hot',                img: C.redhairBack, locked: true, ppv: 59.90 },
    ],
  },
  {
    username: 'jujufuracao', email: 'juju@creator.local',
    displayName: 'Juju Furacão',
    avatar: A.juju, cover: C.truck,
    bio: 'Acompanhante de luxo 🌊🔥 Vídeos hot de praia/piscina, conteúdo molhadinha e atendimento VIP exclusivo 💋',
    monthlyPrice: 34.90,
    socialLinks: { instagram: 'jujufuracao' },
    stats: { photos: 198, videos: 67, locked: 45, likes: 56200, subscribers: 8742 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 34.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 89.42,  discountPercent: 15, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: '💦 Vídeo molhadinha gravado na piscina, hoje',  img: A.juju,        locked: true, ppv: null },
      { caption: '😈 Conteúdo +18 piscina, sem censura',           img: C.truck,       locked: true, ppv: 29.90 },
      { caption: '🔥 PPV: 25 fotos sem biquíni',                    img: C.redhairBack, locked: true, ppv: 39.90 },
    ],
  },
  {
    username: 'melissamont', email: 'melissa@creator.local',
    displayName: 'melissa_montenegro',
    avatar: A.melissa, cover: C.glamour,
    bio: 'Conteúdo +18 autoral 💋 Ensaios explícitos, vídeos hot 3x por semana, atendimento VIP no chat. Sem tabu!',
    monthlyPrice: 24.90,
    socialLinks: { tiktok: 'melissamont' },
    stats: { photos: 142, videos: 38, locked: 22, likes: 28400, subscribers: 5640 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 24.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 67.20, discountPercent: 10, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: '🔥 Ensaio íntimo do dia — assine pra ver',       img: A.melissa, locked: true, ppv: null },
      { caption: '😘 PPV: vídeo solo 10 min explícito',             img: C.glamour, locked: true, ppv: 19.90 },
    ],
  },
  {
    username: 'pretapremium', email: 'preta@creator.local',
    displayName: 'preta_premium',
    avatar: A.preta, cover: C.brunette,
    bio: 'Acompanhante de luxo 💎🔥 Viagens, hotéis 5⭐ e ensaios sem censura. Conteúdo +18 exclusivo, atendimento VIP.',
    monthlyPrice: 39.90,
    socialLinks: { instagram: 'pretapremium', twitter: 'pretapremium' },
    stats: { photos: 380, videos: 121, locked: 70, likes: 198400, subscribers: 14210 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 39.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 107.73, discountPercent: 10, isPromo: true,  displayOrder: 2 },
      { name: '6 meses', intervalMonths: 6, price: 191.52, discountPercent: 20, isPromo: true,  displayOrder: 3 },
    ],
    posts: [
      { caption: '🔥 Vídeo VIP gravado em hotel 5⭐ — sem censura', img: A.preta,        locked: true, ppv: null },
      { caption: '💋 PPV: ensaio molhado de hoje',                   img: C.glamour,      locked: true, ppv: 49.90 },
      { caption: '😈 Pacote 60 fotos + 3 vídeos hot',                 img: C.greenDress,   locked: true, ppv: 89.90 },
      { caption: '🥵 Chamada de vídeo personalizada — DM aberta',    img: C.redhairBack,  locked: true, ppv: 149.90 },
    ],
  },
  {
    username: 'lilipremium', email: 'lili@creator.local',
    displayName: 'Lili Premium',
    avatar: A.lili, cover: C.curlyBlonde,
    bio: 'Loira hot 🌟🔥 Lingerie, boudoir e ensaios sem censura. PPV diário, atendimento personalizado no chat 💌',
    monthlyPrice: 44.90,
    socialLinks: { twitter: 'lilipremium', instagram: 'lilipremium' },
    stats: { photos: 256, videos: 78, locked: 60, likes: 132500, subscribers: 11450 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 44.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 121.23, discountPercent: 10, isPromo: true,  displayOrder: 2 },
      { name: '6 meses', intervalMonths: 6, price: 215.52, discountPercent: 20, isPromo: true,  displayOrder: 3 },
    ],
    posts: [
      { caption: '💋 Lingerie nova chegou — ensaio explícito',       img: A.lili,         locked: true, ppv: null },
      { caption: '🔥 Boudoir VIP — só pra assinantes',                 img: C.glamour,      locked: true, ppv: null },
      { caption: '😈 PPV: 30 fotos + vídeo 8 min sem censura',         img: C.redhairBack,  locked: true, ppv: 44.90 },
    ],
  },
  {
    username: 'anaclaudia', email: 'ana@creator.local',
    displayName: 'Ana Cláudia 🔥',
    avatar: A.ana, cover: C.bunGirl,
    bio: 'Acompanhante de luxo no RJ 🌺💋 Chamada de vídeo personalizada, fotos e vídeos +18 toda semana. Atendimento VIP.',
    monthlyPrice: 29.90,
    socialLinks: { instagram: 'anaclaudiavip', tiktok: 'anaclaudiaof' },
    stats: { photos: 167, videos: 54, locked: 35, likes: 73200, subscribers: 6820 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 29.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 76.24, discountPercent: 15, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: '💕 Ensaio hot do dia — assine pra ver completo',  img: A.ana,         locked: true, ppv: null },
      { caption: '🔥 Chamada de vídeo VIP aberta — DM',              img: C.glamour,     locked: true, ppv: 99.90 },
      { caption: '😈 PPV: 25 fotos quentes + vídeo 5 min',            img: C.redhairBack, locked: true, ppv: 24.90 },
    ],
  },
  {
    username: 'manumiranda', email: 'manu@creator.local',
    displayName: 'Manu Miranda',
    avatar: A.manu, cover: C.doubleBun,
    bio: 'Novinha de SP +18 💋🔥 DMs personalizadas, vídeos exclusivos hot, conteúdo de calcinha toda semana 🥵',
    monthlyPrice: 19.90,
    socialLinks: { twitter: 'manumirandaof' },
    stats: { photos: 89, videos: 23, locked: 15, likes: 31700, subscribers: 3210 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 19.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 47.76, discountPercent: 20, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: '💕 Conteúdo +18 novo, vem ver',                 img: A.manu,         locked: true, ppv: null },
      { caption: '😘 PPV: foto de calcinha + vídeo curtinho',      img: C.greenDress,   locked: true, ppv: 14.90 },
    ],
  },
  {
    username: 'brunaragazza', email: 'bruna@creator.local',
    displayName: 'Bruna Ragazza',
    avatar: A.bruna, cover: C.redhairBack,
    bio: 'Modelo VIP +18 📸💋 Editoriais sem censura, ensaios profissionais explícitos. Tudo o que NÃO vai pro Insta tá aqui.',
    monthlyPrice: 59.90,
    socialLinks: { instagram: 'brunaragazza', twitter: 'brunaragazza' },
    stats: { photos: 421, videos: 156, locked: 90, likes: 245100, subscribers: 18760 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 59.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 152.74, discountPercent: 15, isPromo: true,  displayOrder: 2 },
      { name: '6 meses', intervalMonths: 6, price: 287.52, discountPercent: 20, isPromo: true,  displayOrder: 3 },
    ],
    posts: [
      { caption: '✨ Editorial sem censura da semana',              img: A.bruna,        locked: true, ppv: null },
      { caption: '🎬 Backstage do shoot +18 — só assinantes',       img: C.redhairBack,  locked: true, ppv: null },
      { caption: '🔥 PPV VIP: 50 fotos high-end sem roupa',          img: C.glamour,      locked: true, ppv: 79.90 },
    ],
  },
  {
    username: 'isabellacavalo', email: 'isabella@creator.local',
    displayName: 'Isabella Cavalo',
    avatar: A.isabella, cover: C.freckles,
    bio: 'Ruiva acompanhante de Floripa 🦊🔥 Conteúdo ousado +18, lingerie vermelha, ensaios em hotel. DM aberta 💌',
    monthlyPrice: 34.90,
    socialLinks: { tiktok: 'isabellacavalo', instagram: 'isabellacavalo' },
    stats: { photos: 198, videos: 67, locked: 50, likes: 95400, subscribers: 7890 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 34.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 89.42, discountPercent: 15, isPromo: true,  displayOrder: 2 },
    ],
    posts: [
      { caption: '💋 Lingerie vermelha sem censura',               img: A.isabella,    locked: true, ppv: null },
      { caption: '🔥 Ensaio em hotel 5⭐ liberado pros assinantes', img: C.redhairBack, locked: true, ppv: null },
      { caption: '😈 PPV explícito de R$ 24,90',                    img: C.glamour,     locked: true, ppv: 24.90 },
    ],
  },
  {
    username: 'gabrielatavares', email: 'gabriela@creator.local',
    displayName: 'Gabriela Tavares',
    avatar: A.gabriela, cover: C.greenDress,
    bio: 'Praia, biquíni e muito conteúdo +18 🌊🔥 Atendimento VIP no chat, foto extra de presente pra assinantes!',
    monthlyPrice: 27.90,
    socialLinks: { instagram: 'gabitavares' },
    stats: { photos: 234, videos: 81, locked: 40, likes: 112800, subscribers: 9430 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 27.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 75.33, discountPercent: 10, isPromo: true,  displayOrder: 2 },
      { name: '6 meses', intervalMonths: 6, price: 133.92, discountPercent: 20, isPromo: true, displayOrder: 3 },
    ],
    posts: [
      { caption: '🌴 Praia paradisíaca sem censura, vídeo VIP',    img: A.gabriela,    locked: true, ppv: null },
      { caption: '🔥 PPV: vídeo 12 min sem biquíni',                 img: C.redhairBack, locked: true, ppv: 34.90 },
      { caption: '👙 Pacote 30 fotos hot',                           img: C.greenDress,  locked: true, ppv: 19.90 },
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

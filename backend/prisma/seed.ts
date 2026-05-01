/**
 * Seed — popula APENAS criadoras (modelos) e seus planos.
 * Usuários reais (assinantes) serão criados via fluxo de cadastro.
 *
 * Senha padrão das criadoras: "Fantastic@2026" (apenas para dev).
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PORTRAITS: Record<string, string> = {
  camila:  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
  olivia:  'https://images.unsplash.com/photo-1545912452-8aea7e25a3d3?auto=format&fit=crop&w=800&q=80',
  badmi:   'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
  juju:    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  melissa: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  preta:   'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80',
};

const COVERS: Record<string, string> = {
  beach:  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
  studio: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1600&q=80',
  city:   'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?auto=format&fit=crop&w=1600&q=80',
  bedroom:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
  pool:   'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=80',
};

const creators = [
  {
    username: 'camilabecker', email: 'camila@creator.local',
    displayName: 'Camila Becker',
    avatar: PORTRAITS.camila, cover: COVERS.beach,
    bio: 'Bem-vindos ao meu universo ✨ Conteúdo exclusivo, fotos artísticas e bastidores que ninguém vê em outro lugar. Acesso liberado para vídeos, chamadas e muito mais!',
    monthlyPrice: 39.90,
    socialLinks: { twitter: 'camilabecker', tiktok: 'camilabecker' },
    stats: { photos: 412, videos: 187, locked: 95, likes: 142800, subscribers: 12842 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 39.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 113.72, discountPercent: 5,  isPromo: true,  displayOrder: 2 },
      { name: '6 meses', intervalMonths: 6, price: 201.10, discountPercent: 16, isPromo: true,  displayOrder: 3 },
    ],
  },
  {
    username: 'oliviabianchivip', email: 'olivia@creator.local',
    displayName: 'OLÍVIA BIANCHI',
    avatar: PORTRAITS.olivia, cover: COVERS.studio,
    bio: 'Modelo fitness e empresária. Compartilho meus treinos, dietas e muito mais por aqui. Conteúdo premium toda semana!',
    monthlyPrice: 49.90,
    socialLinks: { twitter: 'oliviabianchi', instagram: 'oliviabianchi' },
    stats: { photos: 287, videos: 94, locked: 110, likes: 89500, subscribers: 9851 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 49.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 134.73, discountPercent: 10, isPromo: true,  displayOrder: 2 },
      { name: '12 meses', intervalMonths: 12, price: 358.92, discountPercent: 40, isPromo: true, displayOrder: 3 },
    ],
  },
  {
    username: 'badmi', email: 'badmi@creator.local',
    displayName: 'BAD MI | MC MIRELLA',
    avatar: PORTRAITS.badmi, cover: COVERS.bedroom,
    bio: 'PUTA CHEFE NÉ BEBÊ? A 01 🏆 Os vídeos contém sexo explícito mostrando tudo, vídeo mamando, se masturbando e tudo mais que você pode imaginar! Aqui tem de tudo!!! NOVINHA DO BUCETÃO atende sem julgamentos.',
    monthlyPrice: 50.00,
    socialLinks: { twitter: 'badmi', tiktok: 'badmi' },
    stats: { photos: 373, videos: 391, locked: 180, likes: 387700, subscribers: 21230 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 50.00,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 142.50, discountPercent: 5,  isPromo: true,  displayOrder: 2 },
      { name: '6 meses', intervalMonths: 6, price: 252.00, discountPercent: 16, isPromo: true,  displayOrder: 3 },
    ],
  },
  {
    username: 'jujufuracao', email: 'juju@creator.local',
    displayName: 'Juju Furacao',
    avatar: PORTRAITS.juju, cover: COVERS.pool,
    bio: 'Praia, treino e muita energia 🌊 Aqui você acompanha minha rotina e os bastidores dos ensaios. Tem promoção rolando!',
    monthlyPrice: 34.90,
    socialLinks: { instagram: 'jujufuracao' },
    stats: { photos: 198, videos: 67, locked: 45, likes: 56200, subscribers: 8742 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 34.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 89.42,  discountPercent: 15, isPromo: true,  displayOrder: 2 },
    ],
  },
  {
    username: 'melissamont', email: 'melissa@creator.local',
    displayName: 'melissa_montenegro',
    avatar: PORTRAITS.melissa, cover: COVERS.studio,
    bio: 'Conteúdo sensual e ensaios autorais. Posto novidades 3x por semana.',
    monthlyPrice: 24.90,
    socialLinks: { tiktok: 'melissamont' },
    stats: { photos: 142, videos: 38, locked: 22, likes: 28400, subscribers: 5640 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 24.90, discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 67.20, discountPercent: 10, isPromo: true,  displayOrder: 2 },
    ],
  },
  {
    username: 'pretapremium', email: 'preta@creator.local',
    displayName: 'preta_premium',
    avatar: PORTRAITS.preta, cover: COVERS.city,
    bio: 'Vivo um lifestyle entre viagens, rotinas de autocuidado e olhar atento aos detalhes do dia a dia. Brilho no próprio ritmo — com leveza, intenção e presença.',
    monthlyPrice: 39.90,
    socialLinks: { instagram: 'pretapremium', twitter: 'pretapremium' },
    stats: { photos: 380, videos: 121, locked: 70, likes: 198400, subscribers: 14210 },
    plans: [
      { name: '1 mês',   intervalMonths: 1, price: 39.90,  discountPercent: 0,  isPromo: false, displayOrder: 1 },
      { name: '3 meses', intervalMonths: 3, price: 107.73, discountPercent: 10, isPromo: true,  displayOrder: 2 },
      { name: '6 meses', intervalMonths: 6, price: 191.52, discountPercent: 20, isPromo: true,  displayOrder: 3 },
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

    // Cria alguns posts: 4 públicos + 2 trancados (PPV) + 2 só assinantes
    const existingPosts = await prisma.post.count({ where: { creatorId: user.id } });
    if (existingPosts === 0) {
      const samples = [
        { caption: `Acabei de postar conteúdo novo, vem ver 🔥`,                                         imageUrl: c.avatar, isLocked: false, ppvPrice: null },
        { caption: `Bastidores do ensaio de hoje 💋`,                                                     imageUrl: c.cover,  isLocked: false, ppvPrice: null },
        { caption: `Conteúdo exclusivo só para assinantes — assina aí 😏`,                               imageUrl: c.cover,  isLocked: true,  ppvPrice: null },
        { caption: `Vídeo PPV chegando! Liberado por R$ 19,90`,                                          imageUrl: c.avatar, isLocked: true,  ppvPrice: 19.90 },
        { caption: `Bom dia gatinhos ☀️`,                                                                 imageUrl: c.avatar, isLocked: false, ppvPrice: null },
        { caption: `Não percam o próximo post, tem surpresa 🎁`,                                          imageUrl: c.cover,  isLocked: false, ppvPrice: null },
      ];
      for (const [idx, s] of samples.entries()) {
        await prisma.post.create({
          data: {
            creatorId:    user.id,
            type:         'PHOTO',
            caption:      s.caption,
            imageUrl:     s.imageUrl,
            thumbnailUrl: s.imageUrl,
            isLocked:     s.isLocked,
            ppvPrice:     s.ppvPrice,
            publishedAt:  new Date(Date.now() - idx * 1000 * 60 * 60 * 4), // espaçamento de 4h
            likeCount:    Math.floor(Math.random() * 800) + 50,
            commentCount: Math.floor(Math.random() * 50),
          },
        });
      }
    }

    console.log(`  ✓ @${c.username} (${c.displayName})`);
  }

  console.log(`\n✅ Seed concluído. ${creators.length} criadoras criadas.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => void prisma.$disconnect());

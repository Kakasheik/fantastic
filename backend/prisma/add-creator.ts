/**
 * Script CLI pra adicionar uma criadora a partir de uma pasta de fotos.
 *
 * Uso:
 *   ts-node prisma/add-creator.ts \
 *     --username bruninha \
 *     --displayName "Bruninha" \
 *     --price 39.90 \
 *     --bio "Bio aqui" \
 *     --folder C:/Users/User/Fantastic/uploads/bruninha
 *
 * O que faz:
 *   1. Lê todas .jpg/.jpeg/.png/.webp da pasta
 *   2. Faz upload pra Supabase Storage (bucket "creators")
 *   3. Cria User + CreatorProfile + 3 SubscriptionPlans
 *   4. Cria N Posts (todos isLocked=true) usando as fotos
 *      - 1ª foto → avatar
 *      - 2ª foto → cover
 *      - todas as fotos → posts no feed
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';

const prisma = new PrismaClient();

const SUPABASE_URL    = process.env.SUPABASE_URL    ?? 'https://jrgzhzvbhkhlnodtquxm.supabase.co';
const SUPABASE_KEY    = process.env.SUPABASE_SERVICE_KEY!;
const BUCKET          = 'creators';

interface Args {
  username: string;
  displayName: string;
  price: number;
  bio: string;
  folder: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialTiktok?: string;
  /** PPV captions específicas — se não passar, gera default */
  captionPrefix?: string;
}

function parseArgs(): Args {
  const args: Record<string, string> = {};
  for (let i = 2; i < process.argv.length; i += 2) {
    const k = process.argv[i].replace(/^--/, '');
    args[k] = process.argv[i + 1];
  }
  if (!args.username || !args.displayName || !args.folder) {
    console.error('Uso: --username X --displayName "X" --price 39.90 --bio "..." --folder /caminho');
    process.exit(1);
  }
  return {
    username:        args.username.toLowerCase(),
    displayName:     args.displayName,
    price:           Number(args.price ?? 39.90),
    bio:             args.bio ?? `${args.displayName} 🔥 Conteúdo +18 exclusivo, vídeos hot e ensaios sem censura.`,
    folder:          args.folder,
    socialTwitter:   args.twitter,
    socialInstagram: args.instagram,
    socialTiktok:    args.tiktok,
    captionPrefix:   args.captionPrefix,
  };
}

/** Faz upload de um Buffer pro Supabase Storage. Retorna URL pública. */
async function uploadToSupabase(buffer: Buffer, filename: string, mime: string): Promise<string> {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey':        SUPABASE_KEY,
      'Content-Type':  mime,
      'x-upsert':      'true',
    },
    body: buffer as unknown as BodyInit,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upload falhou (${res.status}): ${txt}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
}

const PPV_CAPTIONS = [
  '🔥 Foto exclusiva — desbloqueie o pacote completo',
  '💋 Conteúdo +18 hot, sem censura — só pra assinantes',
  '😈 PPV liberado: vídeo + 30 fotos no DM',
  '🥵 Ensaio sensual da semana, vem ver tudo',
  '💕 Bastidores quentes do shoot, exclusivo',
  '🌹 Pacote VIP: foto + chamada de vídeo personalizada',
  '👅 Conteúdo molhado de hoje, libera no DM',
  '🍑 Vídeo gravado pelada — assina ou compra o PPV',
];
const PPV_PRICES = [null, 19.90, 24.90, 29.90, 39.90, 49.90, 79.90];

async function main() {
  const args = parseArgs();
  console.log(`🚀 Criando @${args.username} (${args.displayName})`);

  // 1. Lê fotos da pasta
  const files = fs.readdirSync(args.folder)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort();
  if (files.length === 0) {
    throw new Error(`Nenhuma foto em ${args.folder}`);
  }
  console.log(`  📁 ${files.length} fotos encontradas`);

  // 2. Upload pra Supabase Storage
  const photoUrls: string[] = [];
  for (const [i, file] of files.entries()) {
    const ext = path.extname(file).toLowerCase().replace('.', '');
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const buf = fs.readFileSync(path.join(args.folder, file));
    const hash = createHash('md5').update(buf).digest('hex').slice(0, 8);
    const remoteFilename = `${args.username}/${i + 1}-${hash}.${ext === 'jpeg' ? 'jpg' : ext}`;
    const url = await uploadToSupabase(buf, remoteFilename, mime);
    photoUrls.push(url);
    console.log(`  ⬆️  ${file} → ${url.slice(-60)}`);
  }

  const passwordHash = await bcrypt.hash('Fantastic@2026', 12);
  const avatarUrl = photoUrls[0];
  const coverUrl  = photoUrls[1] ?? photoUrls[0];

  // 3. User + CreatorProfile (upsert)
  const user = await prisma.user.upsert({
    where: { username: args.username },
    update: {
      profilePicture: avatarUrl,
      bio:            args.bio,
      isVerified:     true,
      isAgeVerified:  true,
    },
    create: {
      email:          `${args.username}@creator.fantastic.local`,
      username:       args.username,
      passwordHash,
      role:           'CREATOR',
      profilePicture: avatarUrl,
      bio:            args.bio,
      isVerified:     true,
      isAgeVerified:  true,
    },
  });

  const socialLinks = JSON.stringify({
    twitter:   args.socialTwitter ?? null,
    instagram: args.socialInstagram ?? null,
    tiktok:    args.socialTiktok ?? null,
  });

  const profile = await prisma.creatorProfile.upsert({
    where: { userId: user.id },
    update: {
      displayName:       args.displayName,
      coverImage:        coverUrl,
      bio:               args.bio,
      subscriptionPrice: args.price,
      totalPhotos:       Math.max(80, files.length * 12 + Math.floor(Math.random() * 200)),
      totalVideos:       Math.floor(Math.random() * 80) + 20,
      totalLocked:       Math.floor(Math.random() * 60) + 30,
      totalLikes:        Math.floor(Math.random() * 200000) + 30000,
      totalSubscribers:  Math.floor(Math.random() * 15000) + 2000,
      socialLinks,
      isActive:          true,
    },
    create: {
      userId:            user.id,
      displayName:       args.displayName,
      coverImage:        coverUrl,
      bio:               args.bio,
      subscriptionPrice: args.price,
      totalPhotos:       Math.max(80, files.length * 12 + Math.floor(Math.random() * 200)),
      totalVideos:       Math.floor(Math.random() * 80) + 20,
      totalLocked:       Math.floor(Math.random() * 60) + 30,
      totalLikes:        Math.floor(Math.random() * 200000) + 30000,
      totalSubscribers:  Math.floor(Math.random() * 15000) + 2000,
      socialLinks,
      isActive:          true,
    },
  });

  // 4. Planos (1m / 3m / 6m com promo)
  await prisma.subscriptionPlan.deleteMany({ where: { creatorProfileId: profile.id } });
  const monthly  = args.price;
  const quarter  = Number((monthly * 3 * 0.9).toFixed(2));   // 10% off
  const semester = Number((monthly * 6 * 0.8).toFixed(2));   // 20% off
  await prisma.subscriptionPlan.createMany({
    data: [
      { creatorProfileId: profile.id, name: '1 mês',   intervalMonths: 1, price: monthly,  discountPercent: 0,  isPromo: false, isActive: true, displayOrder: 1 },
      { creatorProfileId: profile.id, name: '3 meses', intervalMonths: 3, price: quarter,  discountPercent: 10, isPromo: true,  isActive: true, displayOrder: 2 },
      { creatorProfileId: profile.id, name: '6 meses', intervalMonths: 6, price: semester, discountPercent: 20, isPromo: true,  isActive: true, displayOrder: 3 },
    ],
  });

  // 5. Posts: todos lockados, captions PPV +18
  await prisma.post.deleteMany({ where: { creatorId: user.id } });
  for (const [idx, photoUrl] of photoUrls.entries()) {
    const caption = PPV_CAPTIONS[idx % PPV_CAPTIONS.length];
    const ppv = PPV_PRICES[idx % PPV_PRICES.length];
    await prisma.post.create({
      data: {
        creatorId:    user.id,
        type:         'PHOTO',
        caption,
        imageUrl:     photoUrl,
        thumbnailUrl: photoUrl,
        isLocked:     true,
        ppvPrice:     ppv,
        publishedAt:  new Date(Date.now() - idx * 1000 * 60 * 60 * 6),
        likeCount:    Math.floor(Math.random() * 2500) + 500,
        commentCount: Math.floor(Math.random() * 150) + 20,
      },
    });
  }

  console.log(`✅ @${args.username} criada com ${photoUrls.length} posts (todos PPV/lockados)`);
  console.log(`   Perfil: https://fantastic-app.vercel.app/${args.username}`);
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => void prisma.$disconnect());

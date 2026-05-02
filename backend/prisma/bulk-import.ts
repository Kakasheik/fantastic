/**
 * Bulk import: itera por TODAS as pastas em uploads/ e cria criadoras.
 * Wipe completo antes de processar.
 *
 * Uso:
 *   ts-node prisma/bulk-import.ts --uploads C:/Users/User/Fantastic/uploads
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const BUCKET       = 'creators';

const BIOS = [
  '🔥 Acompanhante de luxo +18, conteúdo exclusivo sem censura, atendimento VIP. DM aberta 💋',
  '💋 Conteúdo +18 dedicado, ensaios sensuais semanais, chamada de vídeo personalizada 😈',
  '🌹 Modelo VIP +18 — fotos high-end, vídeos hot, pacotes exclusivos no PPV diário',
  '😈 Novinha gostosa do Brasil 🇧🇷 Conteúdo sem tabu, vídeos explícitos toda semana',
  '🥵 Ruiva safada 🦊 Boudoir, lingerie e ensaios em hotel 5⭐ — tudo sem censura',
  '💎 Conteúdo premium +18 — viagens, hotéis e ensaios exclusivos. Atendimento personalizado no chat',
  '🍑 Modelo fitness +18 💪 Treinos hot, after-workout sem roupa, vídeos VIP toda semana',
  '💕 Morena dos sonhos 🌺 Vídeos de calcinha, ensaios molhados e atendimento DM aberto',
];

const PPV_CAPTIONS = [
  '🔥 PPV liberado: vídeo 18 min completo, sem censura',
  '💋 Pacote 50 fotos hot — só pra quem assina',
  '😈 Live privada amanhã às 23h — chama no DM',
  '🍑 Vídeo novo gravado pelada, conteúdo +18',
  '🥵 Chamada de vídeo personalizada — DM aberta',
  '💕 Bastidores quentes do shoot, exclusivo VIP',
  '🌹 Pacote VIP: foto + chamada de vídeo personalizada',
  '👅 Conteúdo molhado de hoje, libera no DM',
  '✨ Editorial sem censura da semana',
  '🎬 Backstage do shoot +18 — só assinantes',
];
const PPV_PRICES: (number | null)[] = [null, 19.90, 24.90, 29.90, 39.90, 49.90, 79.90, null, 14.90, 99.90];

const PUBLIC_CAPTIONS = [
  '🔥 Bom dia, gostosos 💋',
  '✨ Foto nova hoje! Que tal? Deixa o coração aí 💕',
  '😘 Vem me ver no perfil, tem muito mais',
  '💋 Tô on no chat, manda DM 😉',
  '🌹 Olha o look novo! Gostaram?',
  '🥰 Sextou, bb! Quem tá comigo hoje?',
  '😏 Fim de semana cheio de novidade — assina pra ver tudo',
  '💖 Obrigada pelo carinho de sempre, amo vocês',
  '✨ Bastidor de hoje 📸',
  '😈 Tem mais foto desse ensaio nas mensagens',
];

function slugify(s: string): string {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')                          // remove espaços e símbolos
    .slice(0, 30);
}

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
  if (!res.ok) throw new Error(`Upload ${res.status}: ${await res.text()}`);
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
}

function capitalizeWords(s: string): string {
  return s.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

async function processCreator(folderName: string, folderPath: string, idx: number) {
  const username    = slugify(folderName);
  const displayName = capitalizeWords(folderName);
  const price       = [29.90, 34.90, 39.90, 44.90, 49.90, 54.90, 59.90][idx % 7];
  const bio         = BIOS[idx % BIOS.length];

  console.log(`\n🚀 [${idx + 1}] @${username} (${displayName}) — R$ ${price}`);

  const files = fs.readdirSync(folderPath)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort();
  if (files.length === 0) {
    console.log(`  ⚠️  Sem fotos em ${folderPath}, pulando`);
    return;
  }
  console.log(`  📁 ${files.length} fotos`);

  // Categoriza fotos pelo nome do arquivo
  const lower = (s: string) => s.toLowerCase();
  const findFile = (...patterns: RegExp[]) =>
    files.find((f) => patterns.some((p) => p.test(lower(f))));

  const perfilFile = findFile(/^perfil\./, /^avatar\./, /^profile\./);
  const ppvFile    = findFile(/^ppv\./, /^pago\./);
  const feedFile   = findFile(/^feed\./, /^post\./, /^free\./);
  const coverFile  = findFile(/^cover\./, /^capa\./);

  // Fotos extras (que não são nenhuma das nomeadas)
  const namedSet = new Set([perfilFile, ppvFile, feedFile, coverFile].filter(Boolean));
  const extras   = files.filter((f) => !namedSet.has(f));

  console.log(`  🏷️  perfil=${perfilFile ?? '—'}, ppv=${ppvFile ?? '—'}, feed=${feedFile ?? '—'}, cover=${coverFile ?? '—'}, extras=${extras.length}`);

  // Faz upload de uma foto e devolve URL
  const upload = async (file: string, label: string): Promise<string> => {
    const ext  = path.extname(file).toLowerCase().replace('.', '');
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const buf  = fs.readFileSync(path.join(folderPath, file));
    const hash = createHash('md5').update(buf).digest('hex').slice(0, 8);
    const remote = `${username}/${label}-${hash}.${ext === 'jpeg' ? 'jpg' : ext}`;
    const url = await uploadToSupabase(buf, remote, mime);
    console.log(`  ⬆️  ${label.padEnd(8)} ← ${file}`);
    return url;
  };

  // Upload perfil → avatar
  const avatar = perfilFile
    ? await upload(perfilFile, 'avatar')
    : await upload(files[0], 'avatar');

  // Cover: cover.jpg > feed.jpg > primeira extra > ppv > avatar
  const coverFileChosen = coverFile ?? feedFile ?? extras[0] ?? ppvFile ?? files[0];
  const cover = coverFileChosen === perfilFile
    ? avatar
    : coverFileChosen
    ? await upload(coverFileChosen, 'cover')
    : avatar;

  // Posts:
  //  - ppv.* → locked com PPV price (pago pra desbloquear)
  //  - feed.* + extras → PUBLICOS (isLocked=false), aparecem nítidos no feed pra atrair
  //
  // Razão: dá pra criadora um teaser público que serve de promo (igual Privacy/IG).
  // O conteúdo realmente quente fica no PPV/assinatura.
  type PostInput = { url: string; locked: boolean; ppv: number | null; caption: string };
  const posts: PostInput[] = [];

  // PPV — único conteúdo bloqueado por padrão
  if (ppvFile) {
    const url = await upload(ppvFile, 'ppv');
    posts.push({
      url, locked: true, ppv: 39.90,
      caption: '🔥 PPV liberado: pacote completo + vídeo HD sem censura',
    });
  }

  // Feed — público (foto promo)
  if (feedFile && feedFile !== coverFileChosen) {
    const url = await upload(feedFile, 'feed');
    posts.push({
      url, locked: false, ppv: null,
      caption: PUBLIC_CAPTIONS[(idx + 0) % PUBLIC_CAPTIONS.length],
    });
  } else if (feedFile && feedFile === coverFileChosen) {
    posts.push({
      url: cover, locked: false, ppv: null,
      caption: PUBLIC_CAPTIONS[(idx + 0) % PUBLIC_CAPTIONS.length],
    });
  }

  // Extras — públicos (foto promo)
  for (const [i, file] of extras.entries()) {
    const url = await upload(file, `extra${i + 1}`);
    posts.push({
      url, locked: false, ppv: null,
      caption: PUBLIC_CAPTIONS[(idx + i + 1) % PUBLIC_CAPTIONS.length],
    });
  }

  // Se não tem extras nem feed, e só tem ppv, criar 1 post com avatar como public
  if (posts.length === 0 || posts.every((p) => p.locked)) {
    posts.unshift({
      url: avatar, locked: false, ppv: null,
      caption: PUBLIC_CAPTIONS[(idx + 7) % PUBLIC_CAPTIONS.length],
    });
  }

  const passwordHash = await bcrypt.hash('Fantastic@2026', 12);

  const user = await prisma.user.upsert({
    where: { username },
    update: { profilePicture: avatar, bio, isVerified: true, isAgeVerified: true },
    create: {
      email: `${username}@creator.fantastic.local`,
      username,
      passwordHash,
      role: 'CREATOR',
      profilePicture: avatar,
      bio,
      isVerified: true,
      isAgeVerified: true,
    },
  });

  const stats = {
    totalPhotos:      Math.max(80, files.length * 12 + Math.floor(Math.random() * 200)),
    totalVideos:      Math.floor(Math.random() * 80) + 20,
    totalLocked:      Math.floor(Math.random() * 60) + 30,
    totalLikes:       Math.floor(Math.random() * 200000) + 30000,
    totalSubscribers: Math.floor(Math.random() * 15000) + 2000,
  };

  const profile = await prisma.creatorProfile.upsert({
    where: { userId: user.id },
    update: {
      displayName,
      coverImage: cover,
      bio,
      subscriptionPrice: price,
      ...stats,
      socialLinks: JSON.stringify({ twitter: null, instagram: username, tiktok: null }),
      isActive: true,
    },
    create: {
      userId: user.id,
      displayName,
      coverImage: cover,
      bio,
      subscriptionPrice: price,
      ...stats,
      socialLinks: JSON.stringify({ twitter: null, instagram: username, tiktok: null }),
      isActive: true,
    },
  });

  await prisma.subscriptionPlan.deleteMany({ where: { creatorProfileId: profile.id } });
  const monthly  = price;
  const quarter  = Number((monthly * 3 * 0.9).toFixed(2));
  const semester = Number((monthly * 6 * 0.8).toFixed(2));
  await prisma.subscriptionPlan.createMany({
    data: [
      { creatorProfileId: profile.id, name: '1 mês',   intervalMonths: 1, price: monthly,  discountPercent: 0,  isPromo: false, isActive: true, displayOrder: 1 },
      { creatorProfileId: profile.id, name: '3 meses', intervalMonths: 3, price: quarter,  discountPercent: 10, isPromo: true,  isActive: true, displayOrder: 2 },
      { creatorProfileId: profile.id, name: '6 meses', intervalMonths: 6, price: semester, discountPercent: 20, isPromo: true,  isActive: true, displayOrder: 3 },
    ],
  });

  await prisma.post.deleteMany({ where: { creatorId: user.id } });
  for (const [i, p] of posts.entries()) {
    await prisma.post.create({
      data: {
        creatorId:    user.id,
        type:         'PHOTO',
        caption:      p.caption,
        imageUrl:     p.url,
        thumbnailUrl: p.url,
        isLocked:     true,
        ppvPrice:     p.ppv,
        publishedAt:  new Date(Date.now() - i * 1000 * 60 * 60 * 6 - idx * 1000 * 60 * 60 * 24),
        likeCount:    Math.floor(Math.random() * 2500) + 500,
        commentCount: Math.floor(Math.random() * 150) + 20,
      },
    });
  }

  console.log(`  ✅ ${posts.length} posts (todos lockados, PPV em ${posts.filter((p) => p.ppv).length})`);
}

async function main() {
  const uploadsArg = process.argv.find((a, i) => process.argv[i - 1] === '--uploads');
  const uploadsDir = uploadsArg ?? 'C:/Users/User/Fantastic/uploads';
  console.log(`📁 Uploads: ${uploadsDir}`);

  // 1. Wipe completo
  console.log('\n🧹 Wiping all CREATOR data...');
  const allCreators = await prisma.user.findMany({ where: { role: 'CREATOR' }, select: { id: true } });
  const ids = allCreators.map((c) => c.id);
  if (ids.length > 0) {
    await prisma.subscriptionPlan.deleteMany({ where: { creatorProfile: { userId: { in: ids } } } });
    await prisma.creatorProfile.deleteMany({ where: { userId: { in: ids } } });
    await prisma.subscription.deleteMany({ where: { OR: [{ creatorId: { in: ids } }, { subscriberId: { in: ids } }] } });
    await prisma.transaction.deleteMany({ where: { OR: [{ payerId: { in: ids } }, { payeeId: { in: ids } }] } });
    await prisma.refreshToken.deleteMany({ where: { userId: { in: ids } } });
    await prisma.postLike.deleteMany({ where: { post: { creatorId: { in: ids } } } });
    await prisma.comment.deleteMany({ where: { post: { creatorId: { in: ids } } } });
    await prisma.post.deleteMany({ where: { creatorId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  }
  console.log(`  ✓ ${ids.length} creators removidas`);

  // 2. Processa todas as pastas
  const folders = fs.readdirSync(uploadsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  console.log(`\n📦 ${folders.length} pastas:`, folders.join(', '));

  for (const [idx, folderName] of folders.entries()) {
    try {
      await processCreator(folderName, path.join(uploadsDir, folderName), idx);
    } catch (e) {
      console.error(`  ❌ Falha em "${folderName}":`, (e as Error).message);
    }
  }

  console.log(`\n✅ Bulk import concluído.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => void prisma.$disconnect());

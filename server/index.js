import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const port = Number(process.env.PORT || 8787);

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

const styleStrategy = {
  都市轻喜剧: ['职场临时救场', '轻松误会', '状态反转'],
  追妻火葬场: ['情感误会', '迟来的后悔', '女主自我修复'],
  古装宫斗: ['身份压制', '宴前危机', '当众翻盘'],
  宫廷斗争: ['朝堂博弈', '阵营试探', '关键证据翻盘'],
  霸道总裁: ['高压关系', '礼物反差', '身份认同'],
  霸总甜宠: ['关系拉扯', '宠爱反差', '礼物种草'],
  绿茶小三: ['挑衅对照', '证据反击', '爽点打脸'],
  重生逆袭: ['前世遗憾', '重新选择', '结果改写'],
  重生复仇: ['背叛记忆', '反向布局', '层层清算'],
  悬疑反转: ['误导线索', '关键发现', '真相揭晓'],
  家庭伦理: ['家庭争执', '生活痛点', '温和化解'],
  豪门恩怨: ['身份压力', '家族试探', '体面反击'],
  校园青春: ['暗恋误会', '青春约定', '状态加分'],
  青春暗恋: ['双向试探', '告白前紧张', '清甜反转'],
  职场逆袭: ['被质疑', '临场救场', '专业翻盘'],
  职场爽剧: ['公开质疑', '现场验证', '结果打脸'],
  喜剧短剧: ['夸张误会', '连续包袱', '轻松种草'],
  泰式误会: ['高情绪误解', '狗血拉扯', '夸张反转'],
  古装错位: ['身份错位', '替身误会', '反差翻盘'],
  玄幻修仙: ['灵力危机', '秘宝登场', '实力升级'],
  末日生存: ['资源稀缺', '危机选择', '装备救场'],
  未来科幻: ['智能场景', '效率对比', '科技反转'],
  时间循环: ['重复失败', '找到变量', '解决闭环'],
  探案解谜: ['异常线索', '卖点验证', '真相揭晓'],
  娱乐综艺: ['挑战任务', '嘉宾反应', '现场种草'],
  直播间反转: ['弹幕质疑', '现场试用', '结果反转'],
  闺蜜种草: ['朋友追问', '真实分享', '低压转化'],
  亲子育儿: ['带娃痛点', '家庭协作', '省心解决'],
  银发生活: ['父母困扰', '家庭关怀', '实用改善'],
  红果短剧爽文: ['高密度冲突', '爽点打脸', '强 CTA'],
};

const defaultImageNegativePrompt =
  'low quality, blurry, distorted face, extra fingers, wrong packaging, unreadable text, watermark, inconsistent character, different outfit, different location';
const defaultVideoNegativePrompt =
  'low quality, blurry, noisy, flicker, jitter, unstable motion, warped face, identity drift, inconsistent character, extra fingers, bad hands, deformed body, duplicated person, product distortion, wrong packaging, unreadable text, watermark, sudden scene change';

const referenceTemplates = [
  { id: 'character_01', type: 'character', name: '女主角色图', usage: '主角一致性，通勤女性，白衬衫，低马尾' },
  { id: 'character_02', type: 'character', name: '同事角色图', usage: '配角一致性，职场同事，轻喜剧反应' },
  { id: 'product_01', type: 'product', name: '商品参考图', usage: '商品包装、颜色、比例和露出方式一致性' },
  { id: 'scene_01', type: 'scene', name: '办公室洗手间', usage: '钩子与补妆场景' },
  { id: 'scene_02', type: 'scene', name: '会议室', usage: '状态反转与客户会议场景' },
  { id: 'scene_03', type: 'scene', name: '走廊/收口场景', usage: '同事追问与商品种草场景' },
];

function getRuntimeConfig() {
  return {
    storyScriptGenerator: Boolean(process.env.STORY_SCRIPT_GENERATOR_API_URL),
    storyboardImageSkill: Boolean(process.env.STORYBOARD_IMAGE_SKILL_API_URL),
    videoFinisherSkill: Boolean(process.env.VIDEO_FINISHER_SKILL_API_URL),
    seadream: Boolean(process.env.SEADREAM_API_URL),
    seedance: Boolean(process.env.SEEDANCE_API_URL),
  };
}

function authHeader(apiKey) {
  return apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
}

async function postJson(url, apiKey, body, label) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(apiKey),
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(`${label} failed: ${response.status} ${text}`);
  }

  return data;
}

function buildMockSvgDataUrl(title, subtitle, seed, width = 720, height = 1280) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#586dff"/>
          <stop offset="1" stop-color="#101624"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <circle cx="${width * 0.78}" cy="${height * 0.14}" r="${width * 0.18}" fill="rgba(255,255,255,0.14)"/>
      <rect x="${width * 0.12}" y="${height * 0.22}" width="${width * 0.76}" height="${height * 0.42}" rx="42" fill="rgba(255,255,255,0.16)"/>
      <text x="${width / 2}" y="${height * 0.4}" fill="white" font-family="Arial" font-size="46" font-weight="700" text-anchor="middle">${title}</text>
      <text x="${width / 2}" y="${height * 0.48}" fill="rgba(255,255,255,0.82)" font-family="Arial" font-size="24" text-anchor="middle">${subtitle}</text>
      <text x="${width / 2}" y="${height * 0.56}" fill="rgba(255,255,255,0.72)" font-family="Arial" font-size="22" text-anchor="middle">seed ${seed}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildReferencePrompt(asset, brief) {
  if (asset.type === 'character') {
    return `Character reference image, ${brief.ratio}, cinematic realistic commercial short drama. Character ID: ${asset.id}. ${asset.usage}. Fixed wardrobe and face continuity, neutral pose, clear face, soft even lighting, clean simple background. Product story style: ${brief.storyStyle}. Avoid text, watermark, distorted face, extra fingers.`;
  }

  if (asset.type === 'product') {
    return `Product reference image, ${brief.ratio}, clean premium ecommerce visual. Product: ${brief.productName}. Keep packaging, color, shape, scale and usage details consistent. Selling points: ${brief.sellingPoints}. Avoid unreadable text, wrong logo, distorted package, watermark.`;
  }

  return `Scene reference image, ${brief.ratio}, cinematic realistic commercial short drama. Scene ID: ${asset.id}. ${asset.usage}. Clear spatial layout, practical shooting composition, consistent lighting and color palette for ${brief.storyStyle}. Avoid people unless required, avoid text, watermark, clutter.`;
}

function buildFramePrompt(shot, brief, referenceAssets) {
  const refs = referenceAssets.map((asset) => asset.id).join(', ');
  return `Frame ${shot.id}, ${brief.ratio} storyboard key frame, cinematic realistic commercial short drama. Use references: ${refs}. Main action: ${shot.visual}. Scene: ${shot.scene}. Composition and camera: ${shot.camera}. Dialogue/subtitle context: ${shot.dialogue}. Product exposure: ${shot.product}. Continuity: same face, same hairstyle, same wardrobe, same product packaging, same scene layout and color palette as approved references. Quality: high detail, clean composition, realistic anatomy. Avoid embedded text unless specified.`;
}

function buildMotionPrompt(shot, image) {
  return `Use the storyboard key frame as source. Keep the same character, wardrobe, product, scene, lighting, and visual style. Shot ${shot.id}: ${shot.visual}. Visible motion: ${shot.videoPrompt || shot.dialogue || 'short drama action continues naturally'}. Camera: ${shot.camera || 'stable cinematic short-video motion'}. Product continuity: ${shot.product}. Keep motion practical, avoid identity drift and sudden scene changes. Source image: ${image?.outputPath || image?.imageUrl || 'frame image'}.`;
}

function normalizeAsset(asset, index, source) {
  return {
    id: asset.id || asset.assetId || referenceTemplates[index]?.id || `asset_${index + 1}`,
    type: asset.type || referenceTemplates[index]?.type || 'reference',
    name: asset.name || referenceTemplates[index]?.name || `参考资产 ${index + 1}`,
    usage: asset.usage || referenceTemplates[index]?.usage || '',
    status: asset.status || 'done',
    model: asset.model || 'seadream5.0',
    source: asset.source || source,
    seed: asset.seed || 2026062300 + index,
    revision: asset.revision || 1,
    imageUrl: asset.imageUrl || asset.url || asset.outputUrl || asset.output_url || asset.output_path || asset.outputPath || '',
    outputPath: asset.outputPath || asset.output_path || `storyboard_references/${asset.id || `asset_${index + 1}`}.png`,
    prompt: asset.prompt || '',
    negativePrompt: asset.negativePrompt || asset.negative_prompt || defaultImageNegativePrompt,
  };
}

function normalizeStoryboardImage(image, shot, index, source) {
  return {
    shotId: image.shotId || image.id || shot.id,
    status: image.status || 'done',
    model: image.model || 'seadream5.0',
    source: image.source || source,
    seed: image.seed || 2026062200 + index,
    revision: image.revision || 1,
    imageUrl: image.imageUrl || image.url || image.outputUrl || image.output_url || image.output_path || image.outputPath || '',
    outputPath: image.outputPath || image.output_path || `storyboard_images/frame_${String(index + 1).padStart(2, '0')}.png`,
    prompt: image.prompt || shot.imagePrompt || '',
    negativePrompt: image.negativePrompt || image.negative_prompt || defaultImageNegativePrompt,
  };
}

function normalizeVideoClip(clip, shot, index, source) {
  return {
    shotId: clip.shotId || clip.id || shot.id,
    status: clip.status || 'done',
    model: clip.model || 'seedance2.0',
    source: clip.source || source,
    seed: clip.seed || 2026062400 + index,
    revision: clip.revision || 1,
    duration: Number(clip.duration || clip.duration_seconds || shot.duration || 5),
    videoUrl: clip.videoUrl || clip.url || clip.outputUrl || clip.output_url || '',
    outputPath: clip.outputPath || clip.output_path || `storyboard_videos/shot_${String(index + 1).padStart(2, '0')}.mp4`,
    prompt: clip.prompt || shot.videoPrompt || '',
    negativePrompt: clip.negativePrompt || clip.negative_prompt || defaultVideoNegativePrompt,
  };
}

function sendJson(res, status, data) {
  res.writeHead(status, jsonHeaders);
  res.end(JSON.stringify(data));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function normalizeBrief(input) {
  const duration = Number(input.duration || 30);

  return {
    productName: String(input.productName || '').trim() || '未命名商品',
    audience: String(input.audience || '').trim() || '泛消费人群',
    sellingPoints: String(input.sellingPoints || '').trim() || '便捷、实用、适合日常',
    storyStyle: String(input.storyStyle || '').trim() || '自动选择',
    duration: Number.isFinite(duration) ? Math.min(50, Math.max(10, duration)) : 30,
    ratio: String(input.ratio || '9:16'),
    extraInstruction: String(input.extraInstruction || '').trim(),
  };
}

async function generateScriptWithRemoteSkill(brief) {
  const url = process.env.STORY_SCRIPT_GENERATOR_API_URL;
  if (!url) return null;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.STORY_SCRIPT_GENERATOR_API_KEY
        ? { Authorization: `Bearer ${process.env.STORY_SCRIPT_GENERATOR_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({
      skill: 'story-script-generator',
      input: {
        platform: 'douyin',
        product: {
          name: brief.productName,
          audience: brief.audience,
          sellingPoints: brief.sellingPoints,
        },
        creative: {
          storyStyle: brief.storyStyle,
          extraInstruction: brief.extraInstruction,
        },
        duration: brief.duration,
        aspectRatio: brief.ratio,
      },
      outputFormat: 'json',
    }),
  });

  if (!response.ok) {
    throw new Error(`story-script-generator API failed: ${response.status} ${await response.text()}`);
  }

  return normalizeSkillResult(await response.json(), 'story-script-generator-api');
}

function generateScriptWithLocalAdapter(brief) {
  const beats = styleStrategy[brief.storyStyle] || ['商品痛点', '场景冲突', '结果反转'];
  const scene = pickScene(brief.storyStyle);
  const storyboard = buildStoryboard(brief, beats, scene);

  return {
    scriptId: `scr_${Date.now()}`,
    source: 'story-script-generator-local-adapter',
    scriptMarkdown: buildScriptMarkdown(brief, beats, scene, storyboard),
    storyboard,
    warnings: [
      '当前未配置 STORY_SCRIPT_GENERATOR_API_URL，使用后端本地 adapter 生成。',
      '接入真实 Agent/Skill 服务后，该接口会返回真实 story-script-generator 结果。',
    ],
  };
}

async function generateReferences(body) {
  const brief = normalizeBrief(body.brief || {});
  const payload = {
    skill: 'script-to-storyboard-image',
    stage: 'reference_assets',
    model: 'seadream5.0',
    input: {
      script: body.script || '',
      brief,
      storyboard: Array.isArray(body.storyboard) ? body.storyboard : [],
      aspectRatio: brief.ratio,
      referenceTemplates: referenceTemplates.map((asset) => ({
        ...asset,
        prompt: buildReferencePrompt(asset, brief),
      })),
    },
    outputFormat: 'json',
  };

  if (process.env.STORYBOARD_IMAGE_SKILL_API_URL) {
    const raw = await postJson(
      process.env.STORYBOARD_IMAGE_SKILL_API_URL,
      process.env.STORYBOARD_IMAGE_SKILL_API_KEY,
      payload,
      'script-to-storyboard-image reference stage',
    );
    const assets = raw.assets || raw.referenceAssets || raw.references || [];
    return {
      taskId: raw.taskId || `ref_${Date.now()}`,
      source: raw.source || 'script-to-storyboard-image-api',
      skill: 'script-to-storyboard-image',
      model: 'seadream5.0',
      assets: assets.map((asset, index) => normalizeAsset(asset, index, raw.source || 'script-to-storyboard-image-api')),
      warnings: raw.warnings || [],
    };
  }

  if (process.env.SEADREAM_API_URL) {
    const assets = [];
    for (const [index, asset] of referenceTemplates.entries()) {
      const prompt = buildReferencePrompt(asset, brief);
      const raw = await postJson(
        process.env.SEADREAM_API_URL,
        process.env.SEADREAM_API_KEY,
        {
          model: 'seadream5.0',
          prompt,
          negative_prompt: defaultImageNegativePrompt,
          aspect_ratio: brief.ratio,
          resolution: brief.ratio === '16:9' ? '1920x1080' : '1080x1920',
          seed: 2026062300 + index,
          style: 'cinematic realistic commercial',
          output_path: `storyboard_references/${asset.type}s/${asset.id}.png`,
        },
        'seadream5.0 reference generation',
      );
      assets.push(normalizeAsset({ ...asset, ...raw, prompt }, index, 'seadream5.0-api'));
    }

    return {
      taskId: `ref_${Date.now()}`,
      source: 'seadream5.0-api',
      skill: 'script-to-storyboard-image',
      model: 'seadream5.0',
      assets,
      warnings: [],
    };
  }

  return {
    taskId: `ref_${Date.now()}`,
    source: 'storyboard-reference-local-adapter',
    skill: 'script-to-storyboard-image',
    model: 'seadream5.0',
    assets: referenceTemplates.map((asset, index) =>
      normalizeAsset(
        {
          ...asset,
          prompt: buildReferencePrompt(asset, brief),
          imageUrl: buildMockSvgDataUrl(asset.name, 'seadream5.0 local adapter', 2026062300 + index, 720, 960),
        },
        index,
        'storyboard-reference-local-adapter',
      ),
    ),
    warnings: [
      '当前未配置 STORYBOARD_IMAGE_SKILL_API_URL 或 SEADREAM_API_URL，使用后端本地 adapter 生成参考图占位。',
      '线上真实生图需要配置 script-to-storyboard-image 服务或 Seadream 5.0 API。',
    ],
  };
}

async function regenerateReference(body) {
  const result = await generateReferences({
    ...body,
    brief: body.brief,
  });
  const targetId = body.asset?.id;
  const target = result.assets.find((asset) => asset.id === targetId) || result.assets[0];
  const revision = Number(body.asset?.revision || 1) + 1;
  return {
    ...result,
    asset: {
      ...target,
      revision,
      outputPath: target.outputPath.replace(/(\.[^.]+)$/, `_v${revision}$1`),
    },
    assets: undefined,
  };
}

async function generateStoryboardImages(body) {
  const brief = normalizeBrief(body.brief || {});
  const storyboard = Array.isArray(body.storyboard) ? body.storyboard.map(normalizeShot) : [];
  const referenceAssets = Array.isArray(body.referenceAssets) ? body.referenceAssets : [];
  const payload = {
    skill: 'script-to-storyboard-image',
    stage: 'storyboard_frames',
    model: 'seadream5.0',
    input: {
      script: body.script || '',
      brief,
      storyboard,
      referenceAssets,
      aspectRatio: brief.ratio,
    },
    outputFormat: 'json',
  };

  if (process.env.STORYBOARD_IMAGE_SKILL_API_URL) {
    const raw = await postJson(
      process.env.STORYBOARD_IMAGE_SKILL_API_URL,
      process.env.STORYBOARD_IMAGE_SKILL_API_KEY,
      payload,
      'script-to-storyboard-image frame stage',
    );
    const images = raw.images || raw.storyboardImages || raw.frames || [];
    return {
      taskId: raw.taskId || `img_${Date.now()}`,
      source: raw.source || 'script-to-storyboard-image-api',
      skill: 'script-to-storyboard-image',
      model: 'seadream5.0',
      images: storyboard.map((shot, index) => normalizeStoryboardImage(images[index] || {}, shot, index, raw.source || 'script-to-storyboard-image-api')),
      warnings: raw.warnings || [],
    };
  }

  if (process.env.SEADREAM_API_URL) {
    const images = [];
    for (const [index, shot] of storyboard.entries()) {
      const prompt = buildFramePrompt(shot, brief, referenceAssets);
      const raw = await postJson(
        process.env.SEADREAM_API_URL,
        process.env.SEADREAM_API_KEY,
        {
          model: 'seadream5.0',
          prompt,
          image: referenceAssets.map((asset) => asset.imageUrl || asset.outputPath).filter(Boolean),
          negative_prompt: defaultImageNegativePrompt,
          aspect_ratio: brief.ratio,
          resolution: brief.ratio === '16:9' ? '1920x1080' : '1080x1920',
          seed: 2026062200 + index,
          style: 'cinematic realistic commercial',
          output_path: `storyboard_images/frame_${String(index + 1).padStart(2, '0')}.png`,
        },
        'seadream5.0 storyboard frame generation',
      );
      images.push(normalizeStoryboardImage({ ...raw, prompt }, shot, index, 'seadream5.0-api'));
    }

    return {
      taskId: `img_${Date.now()}`,
      source: 'seadream5.0-api',
      skill: 'script-to-storyboard-image',
      model: 'seadream5.0',
      images,
      warnings: [],
    };
  }

  return {
    taskId: `img_${Date.now()}`,
    source: 'storyboard-image-local-adapter',
    skill: 'script-to-storyboard-image',
    model: 'seadream5.0',
    images: storyboard.map((shot, index) =>
      normalizeStoryboardImage(
        {
          prompt: buildFramePrompt(shot, brief, referenceAssets),
          imageUrl: buildMockSvgDataUrl(`Shot ${shot.id}`, `${shot.title} · local adapter`, 2026062200 + index),
        },
        shot,
        index,
        'storyboard-image-local-adapter',
      ),
    ),
    warnings: [
      '当前未配置 STORYBOARD_IMAGE_SKILL_API_URL 或 SEADREAM_API_URL，使用后端本地 adapter 生成首帧图占位。',
      '线上真实首帧图需要配置 script-to-storyboard-image 服务或 Seadream 5.0 API。',
    ],
  };
}

async function regenerateStoryboardImage(body) {
  const result = await generateStoryboardImages(body);
  const targetId = body.shot?.id;
  const target = result.images.find((image) => image.shotId === targetId) || result.images[0];
  const revision = Number(body.currentImage?.revision || 1) + 1;
  return {
    ...result,
    image: {
      ...target,
      revision,
      outputPath: target.outputPath.replace(/(\.[^.]+)$/, `_v${revision}$1`),
    },
    images: undefined,
  };
}

async function generateVideoClips(body) {
  const brief = normalizeBrief(body.brief || {});
  const storyboard = Array.isArray(body.storyboard) ? body.storyboard.map(normalizeShot) : [];
  const storyboardImages = Array.isArray(body.storyboardImages) ? body.storyboardImages : [];
  const payload = {
    skill: 'storyboard-video-finisher',
    stage: 'shot_videos',
    model: 'seedance2.0',
    input: {
      script: body.script || '',
      brief,
      storyboard,
      storyboardImages,
      aspectRatio: brief.ratio,
      fps: 24,
    },
    outputFormat: 'json',
  };

  if (process.env.VIDEO_FINISHER_SKILL_API_URL) {
    const raw = await postJson(
      process.env.VIDEO_FINISHER_SKILL_API_URL,
      process.env.VIDEO_FINISHER_SKILL_API_KEY,
      payload,
      'storyboard-video-finisher shot video stage',
    );
    const clips = raw.clips || raw.videoClips || raw.videos || [];
    return {
      taskId: raw.taskId || `vid_${Date.now()}`,
      source: raw.source || 'storyboard-video-finisher-api',
      skill: 'storyboard-video-finisher',
      model: 'seedance2.0',
      clips: storyboard.map((shot, index) => normalizeVideoClip(clips[index] || {}, shot, index, raw.source || 'storyboard-video-finisher-api')),
      warnings: raw.warnings || [],
    };
  }

  if (process.env.SEEDANCE_API_URL) {
    const clips = [];
    for (const [index, shot] of storyboard.entries()) {
      const image = storyboardImages.find((item) => item.shotId === shot.id);
      const prompt = buildMotionPrompt(shot, image);
      const raw = await postJson(
        process.env.SEEDANCE_API_URL,
        process.env.SEEDANCE_API_KEY,
        {
          model: 'seedance2.0',
          mode: image ? 'image_to_video' : 'text_to_video',
          input_image: image?.imageUrl || image?.outputPath,
          prompt,
          negative_prompt: defaultVideoNegativePrompt,
          aspect_ratio: brief.ratio,
          resolution: brief.ratio === '16:9' ? '1920x1080' : '1080x1920',
          duration_seconds: shot.duration,
          fps: 24,
          camera_motion: shot.camera || 'stable short-video camera motion',
          seed: 2026062400 + index,
          output_path: `storyboard_videos/shot_${String(index + 1).padStart(2, '0')}.mp4`,
        },
        'seedance2.0 shot video generation',
      );
      clips.push(normalizeVideoClip({ ...raw, prompt }, shot, index, 'seedance2.0-api'));
    }

    return {
      taskId: `vid_${Date.now()}`,
      source: 'seedance2.0-api',
      skill: 'storyboard-video-finisher',
      model: 'seedance2.0',
      clips,
      warnings: [],
    };
  }

  return {
    taskId: `vid_${Date.now()}`,
    source: 'video-local-adapter',
    skill: 'storyboard-video-finisher',
    model: 'seedance2.0',
    clips: storyboard.map((shot, index) =>
      normalizeVideoClip(
        {
          prompt: buildMotionPrompt(shot, storyboardImages.find((image) => image.shotId === shot.id)),
        },
        shot,
        index,
        'video-local-adapter',
      ),
    ),
    warnings: [
      '当前未配置 VIDEO_FINISHER_SKILL_API_URL 或 SEEDANCE_API_URL，使用后端本地 adapter 生成视频占位。',
      '线上真实分镜视频需要配置 storyboard-video-finisher 服务或 Seedance 2.0 API。',
    ],
  };
}

async function regenerateVideoClip(body) {
  const result = await generateVideoClips(body);
  const targetId = body.shot?.id;
  const target = result.clips.find((clip) => clip.shotId === targetId) || result.clips[0];
  const revision = Number(body.currentClip?.revision || 1) + 1;
  return {
    ...result,
    clip: {
      ...target,
      revision,
      outputPath: target.outputPath.replace(/(\.[^.]+)$/, `_v${revision}$1`),
    },
    clips: undefined,
  };
}

async function generateFinalCut(body) {
  const brief = normalizeBrief(body.brief || {});
  const storyboard = Array.isArray(body.storyboard) ? body.storyboard.map(normalizeShot) : [];
  const videoClips = Array.isArray(body.videoClips) ? body.videoClips : [];
  const payload = {
    skill: 'storyboard-video-finisher',
    stage: 'final_cut',
    model: 'seedance2.0',
    input: {
      script: body.script || '',
      brief,
      storyboard,
      videoClips,
      aspectRatio: brief.ratio,
      output: {
        subtitles: true,
        music: true,
        soundEffects: true,
        fileName: 'final_cut.mp4',
      },
    },
    outputFormat: 'json',
  };

  if (process.env.VIDEO_FINISHER_SKILL_API_URL) {
    const raw = await postJson(
      process.env.VIDEO_FINISHER_SKILL_API_URL,
      process.env.VIDEO_FINISHER_SKILL_API_KEY,
      payload,
      'storyboard-video-finisher final cut stage',
    );
    return {
      taskId: raw.taskId || `final_${Date.now()}`,
      source: raw.source || 'storyboard-video-finisher-api',
      skill: 'storyboard-video-finisher',
      model: 'seedance2.0',
      finalCut: {
        status: raw.status || 'done',
        outputPath: raw.outputPath || raw.output_path || raw.finalCut?.outputPath || 'final_cut.mp4',
        videoUrl: raw.videoUrl || raw.url || raw.finalCut?.videoUrl || '',
        duration: raw.duration || storyboard.reduce((sum, shot) => sum + shot.duration, 0),
      },
      warnings: raw.warnings || [],
    };
  }

  return {
    taskId: `final_${Date.now()}`,
    source: 'final-cut-local-adapter',
    skill: 'storyboard-video-finisher',
    model: 'seedance2.0',
    finalCut: {
      status: 'done',
      outputPath: 'final_cut.mp4',
      videoUrl: '',
      duration: storyboard.reduce((sum, shot) => sum + shot.duration, 0),
    },
    warnings: [
      '当前未配置 VIDEO_FINISHER_SKILL_API_URL，使用后端本地 adapter 生成成片占位。',
      '线上真实剪辑/成片需要配置 storyboard-video-finisher 服务，或接入可执行剪辑服务。',
    ],
  };
}

function normalizeSkillResult(raw, source) {
  return {
    scriptId: raw.scriptId || `scr_${Date.now()}`,
    source: raw.source || source,
    scriptMarkdown: raw.scriptMarkdown || raw.markdown || raw.content || '',
    storyboard: Array.isArray(raw.storyboard) ? raw.storyboard.map(normalizeShot) : [],
    warnings: Array.isArray(raw.warnings) ? raw.warnings : [],
  };
}

function normalizeShot(shot, index) {
  return {
    id: shot.id || shot.shotId || index + 1,
    title: shot.title || `Shot ${index + 1}`,
    duration: Number(shot.duration || 5),
    scene: shot.scene || '',
    camera: shot.camera || '',
    visual: shot.visual || '',
    dialogue: shot.dialogue || '',
    product: shot.product || shot.productExposure || '',
    imagePrompt: shot.imagePrompt || '',
    videoPrompt: shot.videoPrompt || '',
  };
}

function pickScene(storyStyle) {
  if (storyStyle.includes('古装') || storyStyle.includes('宫')) return '古风内殿、长廊、宴席';
  if (storyStyle.includes('校园') || storyStyle.includes('青春')) return '教室、操场、校门口';
  if (storyStyle.includes('家庭') || storyStyle.includes('亲子') || storyStyle.includes('银发')) return '客厅、厨房、家门口';
  if (storyStyle.includes('直播')) return '直播间、商品展示台';
  if (storyStyle.includes('末日')) return '临时避难点、物资架';
  if (storyStyle.includes('科幻')) return '未来公寓、智能工作台';
  return '办公室、洗手间、会议室';
}

function buildStoryboard(brief, beats, scene) {
  return [
    {
      id: 1,
      title: beats[0],
      duration: 4,
      scene,
      camera: '近景开场，快速推近',
      visual: `主角遇到${brief.audience}熟悉的真实痛点，冲突在前三秒直接出现。`,
      dialogue: `这都什么时候了，怎么偏偏出问题？`,
      product: '商品暂不出现，先建立痛点。',
      imagePrompt: `vertical frame, ${brief.storyStyle}, ${scene}, strong hook, cinematic short drama`,
      videoPrompt: `fast hook shot, character reacts to sudden conflict, short drama pacing`,
    },
    {
      id: 2,
      title: beats[1],
      duration: 6,
      scene,
      camera: '手持快切，中近景交替',
      visual: `冲突升级，旁人质疑主角状态，${brief.productName}从随身场景中自然出现。`,
      dialogue: `你确定现在还能补救？`,
      product: `${brief.productName}弱露出，承接核心卖点：${brief.sellingPoints}。`,
      imagePrompt: `product appears naturally, ${brief.productName}, ${brief.storyStyle}, commerce short video`,
      videoPrompt: `character takes product out naturally, tension rises, quick cuts`,
    },
    {
      id: 3,
      title: '产品解决',
      duration: 7,
      scene,
      camera: '产品特写，使用动作特写',
      visual: `主角使用${brief.productName}，用一个清晰动作展示核心卖点。`,
      dialogue: `关键时候，还是得靠它救场。`,
      product: `商品强露出，展示使用动作和卖点字幕。`,
      imagePrompt: `close up product usage, ${brief.productName}, premium detail, ${brief.ratio}`,
      videoPrompt: `close-up product usage, subtitles show selling points, smooth motion`,
    },
    {
      id: 4,
      title: beats[2],
      duration: 6,
      scene,
      camera: '中景跟拍，情绪反转',
      visual: `主角状态反转，原本质疑的人给出明显反应。`,
      dialogue: `等一下，你刚刚到底做了什么？`,
      product: '商品不抢戏，用结果承接卖点。',
      imagePrompt: `emotional reversal, impressed reaction, ${brief.storyStyle}, short drama`,
      videoPrompt: `character walks back confidently, others react with surprise`,
    },
    {
      id: 5,
      title: '转化收口',
      duration: Math.max(4, brief.duration - 23),
      scene,
      camera: '商品定格，字幕 CTA',
      visual: `主角自然展示商品，给出购买理由和行动引导。`,
      dialogue: `想省事的直接看小黄车，今天这波别错过。`,
      product: `${brief.productName}正面定格，购物车/商品卡提示。`,
      imagePrompt: `product hero shot, ${brief.productName}, clean commerce ending card, ${brief.ratio}`,
      videoPrompt: `final product lockup, CTA subtitles, upbeat ending`,
    },
  ];
}

function buildScriptMarkdown(brief, beats, scene, storyboard) {
  const rows = storyboard
    .map((shot, index) => `| ${index === 0 ? '0' : storyboard.slice(0, index).reduce((sum, item) => sum + item.duration, 0)}-${storyboard.slice(0, index + 1).reduce((sum, item) => sum + item.duration, 0)}s | ${shot.visual} | ${shot.dialogue} | ${shot.product} | ${shot.camera} |`)
    .join('\n');

  return `## 抖音剧情带货脚本

- 商品：${brief.productName}
- 时长：${brief.duration}s
- 平台：抖音
- 目标人群：${brief.audience}
- 核心痛点：${beats[0]}带来的即时困扰
- 核心卖点：${brief.sellingPoints}
- 人物：主角 1 人，推动冲突角色 1 人，围观/转化角色 1 人
- 场景：${scene}
- 剧情风格：${brief.storyStyle}
- 剧情模型：${beats.join(' -> ')} -> 产品解决 -> CTA
- 转化目标：自然引导点击小黄车/商品卡

### 一句话剧情

主角在${brief.storyStyle}剧情里遭遇${beats[0]}，借助「${brief.productName}」完成状态反转，并在结尾自然种草。

### 分镜脚本

| 时间 | 剧情画面 | 台词/字幕 | 商品露出 | 镜头/声音 |
| --- | --- | --- | --- | --- |
${rows}

### 备选开头
- 痛点型：刚出门就翻车，谁懂这一秒的崩溃？
- 反差型：三分钟前还被质疑，三分钟后全场安静了。
- 冲突型：你现在这样，真的能上场吗？
- 结果前置型：她只做了一个动作，局面直接反转。

### CTA 版本
- 想省事的直接看小黄车。
- 同款我放商品卡了，按需拍。
- 今天这波适合先囤，别等临时需要才想起来。

### 自然语言指令
${brief.extraInstruction || '无'}

### 合规提醒
- 避免绝对化、医疗化、无法证实的功效表达。
- 商品效果使用“更适合日常”“使用感”“状态改善”等谨慎表达。`;
}

async function handleGenerateScript(req, res) {
  try {
    const brief = normalizeBrief(await readJsonBody(req));
    const remoteResult = await generateScriptWithRemoteSkill(brief);
    sendJson(res, 200, remoteResult || generateScriptWithLocalAdapter(brief));
  } catch (error) {
    sendJson(res, 500, {
      message: '脚本生成失败',
      detail: error.message,
    });
  }
}

async function handleWorkflowApi(req, res, action, errorMessage) {
  try {
    const body = await readJsonBody(req);
    sendJson(res, 200, await action(body));
  } catch (error) {
    sendJson(res, 500, {
      message: errorMessage,
      detail: error.message,
    });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestedPath = normalize(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = join(distDir, requestedPath);

  if (!filePath.startsWith(distDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const content = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  } catch {
    try {
      const fallback = await readFile(join(distDir, 'index.html'));
      res.writeHead(200, { 'Content-Type': mimeTypes['.html'] });
      res.end(fallback);
    } catch {
      sendJson(res, 404, {
        message: 'Not found. Run npm run build before npm start, or use npm run dev for Vite.',
      });
    }
  }
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, jsonHeaders);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/scripts/generate') {
    await handleGenerateScript(req, res);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/storyboard-references/generate') {
    await handleWorkflowApi(req, res, generateReferences, '参考图生成失败');
    return;
  }

  if (req.method === 'POST' && req.url === '/api/storyboard-references/regenerate') {
    await handleWorkflowApi(req, res, regenerateReference, '参考图重新生成失败');
    return;
  }

  if (req.method === 'POST' && req.url === '/api/storyboard-images/generate') {
    await handleWorkflowApi(req, res, generateStoryboardImages, '分镜首帧图生成失败');
    return;
  }

  if (req.method === 'POST' && req.url === '/api/storyboard-images/regenerate') {
    await handleWorkflowApi(req, res, regenerateStoryboardImage, '分镜首帧图重新生成失败');
    return;
  }

  if (req.method === 'POST' && req.url === '/api/videos/generate') {
    await handleWorkflowApi(req, res, generateVideoClips, '分镜视频生成失败');
    return;
  }

  if (req.method === 'POST' && req.url === '/api/videos/regenerate') {
    await handleWorkflowApi(req, res, regenerateVideoClip, '分镜视频重新生成失败');
    return;
  }

  if (req.method === 'POST' && req.url === '/api/final-cuts/generate') {
    await handleWorkflowApi(req, res, generateFinalCut, '成片生成失败');
    return;
  }

  if (req.method === 'GET' && req.url === '/api/health') {
    sendJson(res, 200, {
      ok: true,
      service: 'story-workflow-web-api',
      storyScriptGenerator: process.env.STORY_SCRIPT_GENERATOR_API_URL ? 'remote' : 'local-adapter',
      integrations: getRuntimeConfig(),
    });
    return;
  }

  if (req.method === 'GET') {
    await serveStatic(req, res);
    return;
  }

  sendJson(res, 405, { message: 'Method not allowed' });
});

server.listen(port, () => {
  console.log(`Story workflow API listening on http://localhost:${port}`);
});

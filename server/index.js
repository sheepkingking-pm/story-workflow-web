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

  if (req.method === 'GET' && req.url === '/api/health') {
    sendJson(res, 200, {
      ok: true,
      service: 'story-workflow-web-api',
      storyScriptGenerator: process.env.STORY_SCRIPT_GENERATOR_API_URL ? 'remote' : 'local-adapter',
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

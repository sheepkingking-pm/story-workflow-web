import { useMemo, useState } from 'react';

const initialBrief = {
  productName: '多效合一气垫 BB',
  audience: '25-35 岁通勤女性',
  sellingPoints: '遮瑕、保湿、持妆、快速补妆',
  storyStyle: '都市轻喜剧',
  duration: 30,
  ratio: '9:16',
  extraInstruction: '剧情要有反转，商品露出自然，不要硬广。',
};

const storyStyleOptions = [
  { value: '都市轻喜剧', label: '都市轻喜剧', hint: '职场、通勤、约会救场，适合生活方式与美妆个护' },
  { value: '追妻火葬场', label: '追妻火葬场', hint: '强情绪误会、反转和后悔流，适合高钩子短剧' },
  { value: '古装宫斗', label: '古装宫斗', hint: '后宫权谋、身份压制、逆袭打脸，适合戏剧化种草' },
  { value: '宫廷斗争', label: '宫廷斗争', hint: '朝堂博弈、阵营对抗、权谋翻盘，适合强戏剧冲突' },
  { value: '霸道总裁', label: '霸道总裁', hint: '高势能男主、身份差、强反差宠爱，适合礼物/高客单商品' },
  { value: '霸总甜宠', label: '霸总甜宠', hint: '强关系张力、宠爱反差、礼物种草，适合女性向商品' },
  { value: '绿茶小三', label: '绿茶小三', hint: '情感挑衅、真假对照、反击打脸，适合强爽点剧情' },
  { value: '重生逆袭', label: '重生逆袭', hint: '前世遗憾、重新选择、爽点复仇，适合功效对比' },
  { value: '重生复仇', label: '重生复仇', hint: '前世背叛、重来复仇、层层清算，适合连续剧钩子' },
  { value: '悬疑反转', label: '悬疑反转', hint: '误导线索、结果反转、强完播，适合测评揭秘' },
  { value: '家庭伦理', label: '家庭伦理', hint: '婆媳、亲子、夫妻冲突，适合家清日百与食品' },
  { value: '豪门恩怨', label: '豪门恩怨', hint: '继承、婚约、身份压制和翻盘，适合高戏剧化商品植入' },
  { value: '校园青春', label: '校园青春', hint: '暗恋、社团、毕业季，适合年轻化商品' },
  { value: '青春暗恋', label: '青春暗恋', hint: '双向暗恋、误会告白、清甜氛围，适合美妆服饰食品' },
  { value: '职场逆袭', label: '职场逆袭', hint: '面试、汇报、客户会救场，适合效率与形象类商品' },
  { value: '职场爽剧', label: '职场爽剧', hint: '被质疑、临场救场、结果打脸，适合强转化短视频' },
  { value: '喜剧短剧', label: '喜剧短剧', hint: '误会、夸张反应、轻松包袱，适合泛生活类商品' },
  { value: '泰式误会', label: '泰式误会', hint: '高情绪误解、狗血拉扯、夸张转折，适合强钩子开头' },
  { value: '古装错位', label: '古装错位', hint: '身份互换、错嫁替身、反差冲突，适合古风视觉创意' },
  { value: '玄幻修仙', label: '玄幻修仙', hint: '金手指、升级、秘宝，适合夸张创意类短剧' },
  { value: '末日生存', label: '末日生存', hint: '资源稀缺、危机选择、生存装备，适合食品户外日用' },
  { value: '未来科幻', label: '未来科幻', hint: '智能设备、未来城市、科技感卖点，适合数码家电' },
  { value: '时间循环', label: '时间循环', hint: '重复同一天、不断试错、找到解决方案，适合功能验证' },
  { value: '探案解谜', label: '探案解谜', hint: '线索推理、真相揭晓，适合卖点拆解型脚本' },
  { value: '娱乐综艺', label: '娱乐综艺', hint: '挑战任务、棚内反应、嘉宾种草，适合轻量测评' },
  { value: '直播间反转', label: '直播间反转', hint: '弹幕质疑、现场试用、结果反转，适合电商转化' },
  { value: '闺蜜种草', label: '闺蜜种草', hint: '朋友追问、真实分享、生活场景，适合低压种草' },
  { value: '亲子育儿', label: '亲子育儿', hint: '带娃痛点、家庭解决方案，适合母婴家居食品' },
  { value: '银发生活', label: '银发生活', hint: '父母健康、家庭关怀、实用改善，适合适老类商品' },
  { value: '自动选择', label: '自动选择', hint: '让 story-script-generator 根据商品、人群和卖点自动匹配风格' },
  { value: '红果短剧爽文', label: '红果短剧爽文', hint: '高密度冲突、打脸爽点、强 CTA，适合转化导向' },
];

const buildScript = (brief) => {
  return `## 抖音剧情带货脚本

- 商品：${brief.productName}
- 时长：${brief.duration}s
- 平台：抖音
- 目标人群：${brief.audience}
- 核心痛点：重要场合前妆面暗沉、状态疲惫、来不及完整化妆
- 核心卖点：${brief.sellingPoints}
- 人物：女主 1 人，同事 1 人，客户/领导 1 人
- 场景：办公室洗手间、会议室、会议室外走廊
- 剧情模型：痛点救场 + 状态反转 + 同事追问种草
- 剧情风格：${brief.storyStyle}
- 自然语言指令：${brief.extraInstruction}
- 转化目标：引导点击购物车/商品卡，突出通勤包常备

### 一句话剧情

女主下班前被临时通知参加重要客户会，脸上疲惫、妆面暗沉。她本想放弃，却在包里拿出「${brief.productName}」快速补妆。三分钟后，她自信走进会议室，用专业表达扭转局面。结尾同事惊讶追问，她轻松展示商品，形成种草转化。

### 分镜脚本

| 时间 | 剧情画面 | 台词/字幕 | 商品露出 | 镜头/声音 |
| --- | --- | --- | --- | --- |
| 0-3s | 女主看着镜子里的疲惫妆面，手机弹出“客户会提前 3 分钟后开始” | 字幕：妆都花了，会议却提前了？ | 无 | 镜面近景，通知音，快速推近 |
| 3-8s | 女主翻包，表情慌张，同事在门口催她 | 同事：快点，客户已经到了！ | 包中弱露出 | 手持快切，制造紧张 |
| 8-16s | 女主拿出${brief.productName}，打开粉扑轻拍补妆 | 女主：三分钟，够不够把状态救回来？ | 产品正面特写 | 产品开盖声，脸部/手部特写 |
| 16-24s | 妆面从暗沉变得更自然，女主整理外套走向会议室 | 字幕：遮瑕、保湿、持妆，通勤补妆不用慌 | 强露出 + 使用动作 | 前后状态对比，节奏加快 |
| 24-${brief.duration}s | 女主会议表现从容，结束后同事追问，她笑着拿出商品 | 女主：不是换了人，是换回我的状态。小黄车有。 | 结尾商品定格 | 音乐起，商品卡/CTA 字幕 |

### 备选开头
- 痛点型：妆花了不可怕，可怕的是客户已经到门口了。
- 反差型：三分钟前她还想逃会，三分钟后客户主动点头。
- 冲突型：同事一句“你现在这样能见客户吗？”直接把她问懵。
- 结果前置型：她只补了 3 分钟，客户却以为她准备了一下午。

### CTA 版本
- 想把状态随身带着的，直接看小黄车。
- 通勤包里放一个，临时救场真的省心。
- 今天有活动，想试的别等妆花了再想起它。

### 拍摄建议
- 人物控制在 2-3 个，尽量用办公室一个主场景完成。
- 商品至少出现 3 次：包内弱露出、使用强露出、结尾定格。
- 避免绝对化功效表达，用“状态更自然”“日常补妆更省心”等合规表达。

### 自然语言指令
${brief.extraInstruction}`;
};

const buildStoryboard = (brief) => [
  {
    id: 1,
    title: '疲惫钩子',
    duration: 4,
    scene: '办公室洗手间镜前',
    camera: '近景，镜面反射，轻微推近',
    visual: '女主看着暗沉妆面，手机弹出客户会提前提醒。',
    dialogue: '重要时刻，偏偏状态最差。',
    product: '商品未出现，制造冲突。',
    imagePrompt: `vertical frame, tired office woman in mirror, modern restroom, ${brief.storyStyle}, cinematic lighting`,
    videoPrompt: 'woman looks at mirror, phone notification pops up, subtle camera push in',
  },
  {
    id: 2,
    title: '三分钟补救',
    duration: 6,
    scene: '洗手台前',
    camera: '手部特写，产品特写，快速切换',
    visual: `女主从包里拿出${brief.productName}，轻拍脸颊完成补妆。`,
    dialogue: '三分钟，够不够把状态救回来？',
    product: '商品正面清晰露出，强调便携和快速补妆。',
    imagePrompt: `beauty product close up, compact cushion in hand, clean counter, premium cosmetic ad, ${brief.ratio}`,
    videoPrompt: 'hand opens compact, sponge taps face, soft glow appears on skin',
  },
  {
    id: 3,
    title: '状态反转',
    duration: 7,
    scene: '会议室门口到会议室内',
    camera: '中景跟拍，进门后轻微环绕',
    visual: '女主从容走进会议室，妆面自然透亮，客户抬头关注。',
    dialogue: '遮住疲惫，也把自信补回来。',
    product: '商品不直接出现，用状态变化承接卖点。',
    imagePrompt: `confident office woman entering meeting room, natural bright makeup, urban drama, ${brief.storyStyle}`,
    videoPrompt: 'woman walks into meeting room confidently, clients look impressed, smooth tracking shot',
  },
  {
    id: 4,
    title: '同事追问',
    duration: 6,
    scene: '会议结束后的走廊',
    camera: '双人中近景，轻松对话',
    visual: '同事惊讶追问女主状态变化，女主笑着拿出商品。',
    dialogue: '不是换了人，是换回了我的状态。',
    product: '商品再次露出，形成记忆点。',
    imagePrompt: `two office women chatting in hallway, cosmetic compact reveal, light comedy, vertical composition`,
    videoPrompt: 'colleague asks surprised, heroine smiles and reveals compact product',
  },
  {
    id: 5,
    title: '转化收口',
    duration: 7,
    scene: '干净产品台面',
    camera: '产品英雄镜头，字幕叠加',
    visual: `商品置于通勤包旁，字幕展示“${brief.sellingPoints}”。`,
    dialogue: '通勤包里的状态开关。',
    product: '商品居中，配合卖点字幕和购买引导。',
    imagePrompt: `hero product shot of ${brief.productName}, commuter bag, soft blue background, premium ecommerce visual`,
    videoPrompt: 'slow product rotation, clean light sweep, text callouts for key selling points',
  },
];

const buildMockImageUrl = (shot, seed) => {
  const colors = ['#586dff', '#28c7ac', '#7049ff', '#ff9f43', '#2f80ed'];
  const bg = colors[(shot.id - 1) % colors.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${bg}"/>
          <stop offset="1" stop-color="#101624"/>
        </linearGradient>
      </defs>
      <rect width="720" height="1280" fill="url(#bg)"/>
      <circle cx="570" cy="180" r="150" fill="rgba(255,255,255,0.14)"/>
      <rect x="90" y="260" width="540" height="620" rx="42" fill="rgba(255,255,255,0.16)"/>
      <text x="360" y="430" fill="white" font-family="Arial" font-size="54" font-weight="700" text-anchor="middle">Shot ${shot.id}</text>
      <text x="360" y="520" fill="white" font-family="Arial" font-size="34" font-weight="700" text-anchor="middle">${shot.title}</text>
      <text x="360" y="610" fill="rgba(255,255,255,0.82)" font-family="Arial" font-size="24" text-anchor="middle">seadream5.0 preview</text>
      <text x="360" y="704" fill="rgba(255,255,255,0.72)" font-family="Arial" font-size="22" text-anchor="middle">seed ${seed}</text>
      <rect x="130" y="955" width="460" height="96" rx="48" fill="rgba(255,255,255,0.2)"/>
      <text x="360" y="1016" fill="white" font-family="Arial" font-size="26" font-weight="700" text-anchor="middle">首帧分镜图</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const buildMockImage = (shot, index, payload, revision = 1) => {
  const seed = 2026062200 + index + (revision - 1) * 100;

  return {
    shotId: shot.id,
    model: payload.model,
    skill: payload.skill,
    status: 'done',
    seed,
    revision,
    imageUrl: buildMockImageUrl(shot, seed),
    outputPath: `storyboard_images/frame_${String(index + 1).padStart(2, '0')}_v${revision}.png`,
    prompt: shot.imagePrompt,
    negativePrompt:
      'low quality, blurry, distorted face, extra fingers, wrong packaging, unreadable text, watermark',
  };
};

const buildMockReferenceUrl = (asset, seed) => {
  const colors = {
    character: '#586dff',
    scene: '#28c7ac',
  };
  const bg = colors[asset.type] || '#7049ff';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${bg}"/>
          <stop offset="1" stop-color="#101624"/>
        </linearGradient>
      </defs>
      <rect width="720" height="960" fill="url(#bg)"/>
      <rect x="72" y="132" width="576" height="560" rx="44" fill="rgba(255,255,255,0.16)"/>
      <circle cx="360" cy="324" r="96" fill="rgba(255,255,255,0.22)"/>
      <rect x="230" y="450" width="260" height="150" rx="75" fill="rgba(255,255,255,0.18)"/>
      <text x="360" y="760" fill="white" font-family="Arial" font-size="42" font-weight="700" text-anchor="middle">${asset.name}</text>
      <text x="360" y="820" fill="rgba(255,255,255,0.78)" font-family="Arial" font-size="24" text-anchor="middle">${asset.id} · seed ${seed}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const buildMockReferenceAsset = (asset, index, revision = 1) => {
  const seed = 2026062300 + index + (revision - 1) * 100;

  return {
    ...asset,
    status: 'done',
    seed,
    revision,
    imageUrl: buildMockReferenceUrl(asset, seed),
    outputPath: `storyboard_references/${asset.type}s/${asset.id}_v${revision}.png`,
  };
};

const referenceTemplates = [
  { id: 'character_01', type: 'character', name: '女主角色图', usage: '主角一致性，通勤女性，白衬衫，低马尾' },
  { id: 'character_02', type: 'character', name: '同事角色图', usage: '配角一致性，职场同事，轻喜剧反应' },
  { id: 'scene_01', type: 'scene', name: '办公室洗手间', usage: '钩子与补妆场景' },
  { id: 'scene_02', type: 'scene', name: '会议室', usage: '状态反转与客户会议场景' },
  { id: 'scene_03', type: 'scene', name: '走廊/收口场景', usage: '同事追问与商品种草场景' },
];

const mockReferenceAssetApi = () =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({
        taskId: `ref_${Date.now()}`,
        skill: 'script-to-storyboard-image',
        model: 'seadream5.0',
        assets: referenceTemplates.map((asset, index) => buildMockReferenceAsset(asset, index)),
      });
    }, 900);
  });

const mockStoryboardImageApi = (payload) =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({
        taskId: `img_${Date.now()}`,
        skill: payload.skill,
        model: payload.model,
        images: payload.storyboard.map((shot, index) => buildMockImage(shot, index, payload)),
      });
    }, 900);
  });

const buildMockVideoClip = (shot, index, revision = 1) => {
  const seed = 2026062400 + index + (revision - 1) * 100;

  return {
    shotId: shot.id,
    status: 'done',
    model: 'seedance2.0',
    seed,
    revision,
    duration: shot.duration,
    outputPath: `storyboard_videos/shot_${String(index + 1).padStart(2, '0')}_v${revision}.mp4`,
    prompt: shot.videoPrompt,
  };
};

function App() {
  const [brief, setBrief] = useState(initialBrief);
  const [productPreview, setProductPreview] = useState('');
  const [script, setScript] = useState('');
  const [generatedStoryboard, setGeneratedStoryboard] = useState([]);
  const [scriptStatus, setScriptStatus] = useState('idle');
  const [scriptError, setScriptError] = useState('');
  const [scriptSource, setScriptSource] = useState('');
  const [scriptWarnings, setScriptWarnings] = useState([]);
  const [storyboard, setStoryboard] = useState([]);
  const [referenceAssets, setReferenceAssets] = useState([]);
  const [referenceStatus, setReferenceStatus] = useState('idle');
  const [storyboardImages, setStoryboardImages] = useState([]);
  const [imageStatus, setImageStatus] = useState('idle');
  const [videoClips, setVideoClips] = useState([]);
  const [videoStatus, setVideoStatus] = useState('idle');
  const [finalStatus, setFinalStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState(1);

  const progress = useMemo(() => {
    if (finalStatus === 'done') return 100;
    if (finalStatus === 'running') return 94;
    if (videoStatus === 'confirmed') return 88;
    if (videoStatus === 'done') return 82;
    if (videoStatus === 'running') return 78;
    if (imageStatus === 'confirmed') return 72;
    if (imageStatus === 'done') return 68;
    if (referenceStatus === 'confirmed') return 55;
    if (referenceStatus === 'done') return 46;
    if (storyboard.length) return 34;
    if (script) return 24;
    return productPreview ? 14 : 8;
  }, [finalStatus, imageStatus, productPreview, referenceStatus, script, storyboard.length, videoStatus]);

  const tasks = [
    { name: '商品理解', status: script ? '完成' : productPreview ? '待生成脚本' : '待输入' },
    { name: '脚本确认', status: storyboard.length ? '已确认' : script ? '待确认' : '待生成' },
    { name: '参考图确认', status: referenceStatus === 'confirmed' ? '已确认' : referenceStatus === 'done' ? '待确认' : referenceStatus === 'running' ? '运行中' : '待执行' },
    { name: '首帧图确认', status: imageStatus === 'confirmed' ? '已确认' : imageStatus === 'done' ? '待确认' : imageStatus === 'running' ? '运行中' : '待参考图确认' },
    { name: '分镜生成', status: videoStatus === 'confirmed' ? '已确认' : videoStatus === 'done' ? '待确认' : videoStatus === 'running' ? '运行中' : '待首帧确认' },
    { name: '成片', status: finalStatus === 'done' ? '可导出' : finalStatus === 'running' ? '运行中' : '待分镜确认' },
  ];

  const updateBrief = (field, value) => {
    setBrief((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProductPreview(URL.createObjectURL(file));
  };

  const handleGenerateScript = async () => {
    setScriptStatus('running');
    setScriptError('');
    setScriptSource('');
    setScriptWarnings([]);
    setScript('');
    setGeneratedStoryboard([]);
    setStoryboard([]);
    setReferenceAssets([]);
    setReferenceStatus('idle');
    setStoryboardImages([]);
    setImageStatus('idle');
    setVideoClips([]);
    setVideoStatus('idle');
    setFinalStatus('idle');
    setCurrentStep(2);

    try {
      const response = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brief),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || result.message || '脚本生成失败');
      }

      setScript(result.scriptMarkdown || buildScript(brief));
      setGeneratedStoryboard(Array.isArray(result.storyboard) ? result.storyboard : []);
      setScriptSource(result.source || 'story-script-generator');
      setScriptWarnings(Array.isArray(result.warnings) ? result.warnings : []);
      setScriptStatus('done');
    } catch (error) {
      setScriptError(error.message || '脚本生成失败');
      setScriptStatus('error');
    }
  };

  const handleConfirmScript = () => {
    setStoryboard(generatedStoryboard.length ? generatedStoryboard : buildStoryboard(brief));
    setReferenceAssets([]);
    setReferenceStatus('idle');
    setStoryboardImages([]);
    setImageStatus('idle');
    setVideoClips([]);
    setVideoStatus('idle');
    setFinalStatus('idle');
    setCurrentStep(3);
  };

  const runReferenceGeneration = async () => {
    setReferenceStatus('running');
    setStoryboardImages([]);
    setImageStatus('idle');
    setVideoClips([]);
    setVideoStatus('idle');
    setFinalStatus('idle');
    setCurrentStep(3);

    const result = await mockReferenceAssetApi({
      skill: 'script-to-storyboard-image',
      model: 'seadream5.0',
      aspectRatio: brief.ratio,
      script,
      brief,
      storyboard,
    });

    setReferenceAssets(result.assets);
    setReferenceStatus('done');
  };

  const confirmReferenceAssets = () => {
    setReferenceStatus('confirmed');
    setCurrentStep(4);
  };

  const regenerateReferenceAsset = (asset) => {
    const assetIndex = referenceTemplates.findIndex((item) => item.id === asset.id);
    const nextRevision = (asset.revision || 1) + 1;
    const nextAsset = buildMockReferenceAsset(asset, assetIndex, nextRevision);

    setReferenceAssets((prev) => {
      const rest = prev.filter((item) => item.id !== asset.id);
      return [...rest, nextAsset].sort((a, b) => a.id.localeCompare(b.id));
    });
    setReferenceStatus('done');
    setStoryboardImages([]);
    setImageStatus('idle');
    setVideoClips([]);
    setVideoStatus('idle');
    setFinalStatus('idle');
  };

  const runImageGeneration = async () => {
    setImageStatus('running');
    setVideoClips([]);
    setVideoStatus('idle');
    setFinalStatus('idle');
    setCurrentStep(4);

    const payload = {
      skill: 'script-to-storyboard-image',
      model: 'seadream5.0',
      aspectRatio: brief.ratio,
      script,
      brief,
      storyboard,
      referenceAssets,
    };

    const result = await mockStoryboardImageApi(payload);
    setStoryboardImages(result.images);
    setImageStatus('done');
  };

  const confirmStoryboardImages = () => {
    setImageStatus('confirmed');
    runVideoGeneration();
  };

  const regenerateShotImage = (shot) => {
    const shotIndex = storyboard.findIndex((item) => item.id === shot.id);
    const currentImage = storyboardImages.find((image) => image.shotId === shot.id);
    const payload = {
      skill: 'script-to-storyboard-image',
      model: 'seadream5.0',
    };
    const nextRevision = (currentImage?.revision || 1) + 1;
    const nextImage = buildMockImage(shot, shotIndex, payload, nextRevision);

    setStoryboardImages((prev) => {
      const rest = prev.filter((image) => image.shotId !== shot.id);
      return [...rest, nextImage].sort((a, b) => a.shotId - b.shotId);
    });
    setImageStatus('done');
    setVideoClips([]);
    setVideoStatus('idle');
    setFinalStatus('idle');
  };

  const runVideoGeneration = () => {
    setVideoStatus('running');
    setFinalStatus('idle');
    setCurrentStep(5);
    window.setTimeout(() => {
      setVideoClips(storyboard.map((shot, index) => buildMockVideoClip(shot, index)));
      setVideoStatus('done');
    }, 1100);
  };

  const regenerateVideoClip = (shot) => {
    const shotIndex = storyboard.findIndex((item) => item.id === shot.id);
    const currentClip = videoClips.find((clip) => clip.shotId === shot.id);
    const nextRevision = (currentClip?.revision || 1) + 1;
    const nextClip = buildMockVideoClip(shot, shotIndex, nextRevision);

    setVideoClips((prev) => {
      const rest = prev.filter((clip) => clip.shotId !== shot.id);
      return [...rest, nextClip].sort((a, b) => a.shotId - b.shotId);
    });
    setVideoStatus('done');
    setFinalStatus('idle');
  };

  const confirmVideoClips = () => {
    setVideoStatus('confirmed');
    setCurrentStep(6);
  };

  const runFinalGeneration = () => {
    setFinalStatus('running');
    setCurrentStep(6);
    window.setTimeout(() => {
      setFinalStatus('done');
    }, 900);
  };

  const exportProject = () => {
    const project = {
      brief,
      script,
      storyboard,
      referenceAssets,
      storyboardImages,
      videoClips,
      modelPlan: {
        storyboardSkill: 'script-to-storyboard-image',
        imageModel: 'seadream5.0',
        videoModel: 'seedance2.0',
        editingEngine: 'ffmpeg/remotion',
      },
      timeline: storyboard.map((shot) => ({
        track: 'main_video',
        start: storyboard.slice(0, shot.id - 1).reduce((sum, item) => sum + item.duration, 0),
        duration: shot.duration,
        source: videoClips.find((clip) => clip.shotId === shot.id)?.outputPath || `shot_${shot.id}_seedance.mp4`,
        subtitle: shot.dialogue,
      })),
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'story-workflow-project.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Story Commerce Agent</p>
          <h1>剧情成片半自动工作流</h1>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button">保存草稿</button>
          <button className="primary-button" disabled={finalStatus !== 'done'} onClick={exportProject}>
            导出工程 JSON
          </button>
        </div>
      </header>

      <section className="progress-card">
        <div className="progress-header">
          <span>当前阶段：{currentStep}/6</span>
          <strong>{progress}%</strong>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="steps">
          {['商品理解', '脚本确认', '参考图确认', '首帧图确认', '分镜生成', '成片'].map((step, index) => (
            <span key={step} className={currentStep >= index + 1 ? 'step active' : 'step'}>
              {step}
            </span>
          ))}
        </div>
      </section>

      <section className="task-overview">
        {tasks.map((task) => (
          <div key={task.name} className="task-item">
            <span>{task.name}</span>
            <strong className={['完成', '可导出', '已确认'].includes(task.status) ? 'ok' : ''}>{task.status}</strong>
          </div>
        ))}
      </section>

      <main className="workspace">
        <section className="panel brief-panel">
          <div className="panel-title">
            <span>01</span>
            <h2>商品理解</h2>
          </div>

          <label className="upload-box">
            {productPreview ? <img src={productPreview} alt="商品预览" /> : <span>上传商品图</span>}
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>

          <label>
            商品名称
            <input value={brief.productName} onChange={(event) => updateBrief('productName', event.target.value)} />
          </label>

          <label>
            目标人群
            <input value={brief.audience} onChange={(event) => updateBrief('audience', event.target.value)} />
          </label>

          <label>
            核心卖点
            <textarea rows="3" value={brief.sellingPoints} onChange={(event) => updateBrief('sellingPoints', event.target.value)} />
          </label>

          <label className="style-field">
            风格需求
            <div className="style-grid">
              {storyStyleOptions.map((option) => (
                <button
                  key={option.value}
                  className={brief.storyStyle === option.value ? 'style-option active' : 'style-option'}
                  type="button"
                  onClick={() => updateBrief('storyStyle', option.value)}
                >
                  <span className="radio-dot" />
                  {option.label}
                </button>
              ))}
            </div>
            <small className="field-hint">{storyStyleOptions.find((option) => option.value === brief.storyStyle)?.hint}</small>
          </label>

          <div className="inline-fields">
            <label>
              时长
              <input type="number" value={brief.duration} onChange={(event) => updateBrief('duration', Number(event.target.value))} />
            </label>
            <label>
              画幅
              <select value={brief.ratio} onChange={(event) => updateBrief('ratio', event.target.value)}>
                <option>9:16</option>
                <option>1:1</option>
                <option>16:9</option>
              </select>
            </label>
          </div>

          <label>
            自然语言指令 / 额外要求
            <textarea
              rows="4"
              placeholder="可输入约束或剧情梗概，例如：前三秒必须有冲突、女主被误会后反转、商品露出不要硬广、结尾引导小黄车。"
              value={brief.extraInstruction}
              onChange={(event) => updateBrief('extraInstruction', event.target.value)}
            />
          </label>

          <button className="primary-button full" disabled={scriptStatus === 'running'} onClick={handleGenerateScript}>
            {scriptStatus === 'running' ? 'story-script-generator 生成中...' : '完成商品理解并生成脚本'}
          </button>
        </section>

        <section className="panel script-panel">
          <div className="panel-title">
            <span>02</span>
            <h2>脚本确认</h2>
          </div>

          <div className="script-box">
            {scriptStatus === 'running' ? (
              <div className="empty-state">正在调用 /api/scripts/generate，等待 story-script-generator 返回脚本...</div>
            ) : script ? (
              <textarea value={script} onChange={(event) => setScript(event.target.value)} />
            ) : (
              <div className="empty-state">填写左侧 brief 后，点击“用 story-script-generator 生成脚本”。</div>
            )}
          </div>

          {scriptError && <div className="script-alert error">脚本生成失败：{scriptError}</div>}
          {scriptSource && (
            <div className="script-meta">
              <strong>脚本来源</strong>
              <span>{scriptSource}</span>
            </div>
          )}
          {scriptWarnings.length > 0 && (
            <div className="script-alert">
              {scriptWarnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          )}

          <div className="action-row">
            <button className="secondary-button" disabled={!script || scriptStatus === 'running'} onClick={handleGenerateScript}>
              {scriptStatus === 'running' ? '生成中...' : '重新生成'}
            </button>
            <button className="primary-button" disabled={!script || scriptStatus === 'running'} onClick={handleConfirmScript}>
              确认脚本，进入参考图确认
            </button>
          </div>

        </section>

        <section className="panel reference-panel">
          <div className="panel-title">
            <span>03</span>
            <h2>参考图确认</h2>
          </div>

          {referenceAssets.length > 0 && (
            <div className="reference-section">
              <div className="reference-header">
                <h3>03 参考图确认</h3>
                <span>{referenceStatus === 'confirmed' ? '已确认' : '待确认'}</span>
              </div>
              <div className="reference-grid">
                {referenceAssets.map((asset) => (
                  <article key={asset.id} className="reference-card">
                    <img src={asset.imageUrl} alt={asset.name} />
                    <div>
                      <strong>{asset.name}</strong>
                      <p>{asset.usage}</p>
                      <small>{asset.outputPath}</small>
                    </div>
                    <button className="mini-button" type="button" onClick={() => regenerateReferenceAsset(asset)}>
                      重新生成
                    </button>
                  </article>
                ))}
              </div>
              {referenceStatus !== 'confirmed' && (
                <button className="primary-button full" type="button" onClick={confirmReferenceAssets}>
                  确认角色图和场景图
                </button>
              )}
            </div>
          )}
          {!referenceAssets.length && (
            <>
              <div className="empty-state compact">确认脚本后，调用 Seadream 5.0 生成角色图和场景图。</div>
              <button className="primary-button full" disabled={!storyboard.length || referenceStatus === 'running'} onClick={runReferenceGeneration}>
                调用 Seadream 5.0 生成参考图
              </button>
            </>
          )}
        </section>

        <section className="panel frame-panel">
          <div className="panel-title">
            <span>04</span>
            <h2>分镜首帧图确认</h2>
          </div>
          {storyboardImages.length > 0 && (
            <div className="frame-section">
              <div className="reference-header">
                <h3>04 分镜首帧图确认</h3>
                <span>{imageStatus === 'confirmed' ? '已确认' : '待确认'}</span>
              </div>
              <div className="storyboard-grid frame-grid">
                {storyboard.map((shot) => {
                  const shotImage = storyboardImages.find((image) => image.shotId === shot.id);
                  if (!shotImage) return null;

                  return (
                    <article key={shot.id} className="shot-card">
                      <div className="shot-cover">
                        <img src={shotImage.imageUrl} alt={`${shot.title} 首帧`} />
                        <div className="shot-cover-overlay">
                          <span>Shot {shot.id}</span>
                          <small>首帧已生成</small>
                        </div>
                      </div>
                      <div className="shot-body">
                        <div className="shot-heading">
                          <strong>{shot.title}</strong>
                          <span>{shot.duration}s</span>
                        </div>
                        <dl>
                          <dt>图片</dt>
                          <dd>{shotImage.outputPath}</dd>
                          <dt>Seed</dt>
                          <dd>{shotImage.seed}</dd>
                        </dl>
                        <button className="mini-button" type="button" onClick={() => regenerateShotImage(shot)}>
                          重新生成本张
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              {imageStatus !== 'confirmed' && (
                <button className="primary-button full" type="button" onClick={confirmStoryboardImages}>
                  确认分镜首帧图
                </button>
              )}
            </div>
          )}
          {!storyboardImages.length && (
            <>
              <div className="empty-state compact">确认参考图后，调用 Seadream 5.0 生成每个分镜首帧图。</div>
              <button className="primary-button full" disabled={referenceStatus !== 'confirmed' || imageStatus === 'running'} onClick={runImageGeneration}>
                调用 Seadream 5.0 生成首帧图
              </button>
            </>
          )}
        </section>

        <section className="panel video-panel">
          <div className="panel-title">
            <span>05</span>
            <h2>分镜生成</h2>
          </div>
          <div className="timeline-card">
            <h3>05 分镜生成</h3>
            {videoClips.length ? (
              <div className="video-grid">
                {storyboard.map((shot) => {
                  const clip = videoClips.find((item) => item.shotId === shot.id);
                  if (!clip) return null;

                  return (
                    <article key={shot.id} className="video-card">
                      <div className="video-cover">
                        <span>Shot {shot.id}</span>
                        <small>{clip.model}</small>
                      </div>
                      <div className="video-body">
                        <div className="shot-heading">
                          <strong>{shot.title}</strong>
                          <span>{clip.duration}s</span>
                        </div>
                        <dl>
                          <dt>视频</dt>
                          <dd>{clip.outputPath}</dd>
                          <dt>Seed</dt>
                          <dd>{clip.seed}</dd>
                        </dl>
                        <button className="mini-button" type="button" onClick={() => regenerateVideoClip(shot)}>
                          重新生成本段
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : storyboard.length ? (
              <div className="timeline">
                {storyboard.map((shot) => (
                  <div key={shot.id} className="timeline-clip" style={{ flexGrow: shot.duration }}>
                    <span>{shot.id}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>确认脚本后自动生成时间线。</p>
            )}
          </div>
          {videoClips.length > 0 && videoStatus !== 'confirmed' ? (
            <button className="primary-button full" type="button" onClick={confirmVideoClips}>
              确认分镜视频
            </button>
          ) : null}
        </section>

        <section className="panel final-panel">
          <div className="panel-title">
            <span>06</span>
            <h2>成片</h2>
          </div>
          <div className="preview-card">
            <div className="phone-frame">
              {videoStatus === 'done' ? (
                <div className="pending-preview">分镜视频待确认</div>
              ) : finalStatus === 'done' ? (
                <div className="final-preview">
                  <span>06 成片预览</span>
                  <strong>{brief.productName}</strong>
                  <small>字幕 + 配音 + BGM + 转场</small>
                </div>
              ) : (
                <div className="pending-preview">{videoStatus === 'confirmed' ? '等待成片生成' : '等待分镜确认'}</div>
              )}
            </div>
          </div>
          <button className="primary-button full" disabled={videoStatus !== 'confirmed' || finalStatus === 'running'} onClick={runFinalGeneration}>
            生成成片
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;

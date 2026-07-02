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

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const apiUrl = (path) => `${apiBaseUrl}${path}`;
const apiPost = async (path, payload) => {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.message || '请求失败');
  }

  return result;
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
  const [finalCut, setFinalCut] = useState(null);
  const [workflowMessages, setWorkflowMessages] = useState([]);
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
    { name: '参考图确认', status: referenceStatus === 'error' ? '失败' : referenceStatus === 'confirmed' ? '已确认' : referenceStatus === 'done' ? '待确认' : referenceStatus === 'running' ? '运行中' : '待执行' },
    { name: '首帧图确认', status: imageStatus === 'error' ? '失败' : imageStatus === 'confirmed' ? '已确认' : imageStatus === 'done' ? '待确认' : imageStatus === 'running' ? '运行中' : '待参考图确认' },
    { name: '分镜生成', status: videoStatus === 'error' ? '失败' : videoStatus === 'confirmed' ? '已确认' : videoStatus === 'done' ? '待确认' : videoStatus === 'running' ? '运行中' : '待首帧确认' },
    { name: '成片', status: finalStatus === 'error' ? '失败' : finalStatus === 'done' ? '可导出' : finalStatus === 'running' ? '运行中' : '待分镜确认' },
  ];

  const applyWorkflowMessages = (result) => {
    const messages = [
      result.source ? `调用来源：${result.source}` : '',
      ...(Array.isArray(result.warnings) ? result.warnings : []),
    ].filter(Boolean);

    setWorkflowMessages(messages);
  };

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
    setFinalCut(null);
    setWorkflowMessages([]);
    setCurrentStep(2);

    try {
      const response = await fetch(apiUrl('/api/scripts/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brief),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || result.message || '脚本生成失败');
      }

      if (!result.scriptMarkdown) {
        throw new Error('脚本接口未返回 scriptMarkdown');
      }

      setGeneratedStoryboard(Array.isArray(result.storyboard) ? result.storyboard : []);
      setScript(result.scriptMarkdown);
      setScriptSource(result.source || 'story-script-generator');
      setScriptWarnings(Array.isArray(result.warnings) ? result.warnings : []);
      setScriptStatus('done');
    } catch (error) {
      setScriptError(error.message || '脚本生成失败');
      setScriptStatus('error');
    }
  };

  const handleConfirmScript = () => {
    if (!generatedStoryboard.length) {
      setScriptError('脚本接口未返回 storyboard，无法进入参考图生成。');
      return;
    }

    setStoryboard(generatedStoryboard);
    setReferenceAssets([]);
    setReferenceStatus('idle');
    setStoryboardImages([]);
    setImageStatus('idle');
    setVideoClips([]);
    setVideoStatus('idle');
    setFinalStatus('idle');
    setFinalCut(null);
    setCurrentStep(3);
  };

  const runReferenceGeneration = async () => {
    setReferenceStatus('running');
    setStoryboardImages([]);
    setImageStatus('idle');
    setVideoClips([]);
    setVideoStatus('idle');
    setFinalStatus('idle');
    setFinalCut(null);
    setCurrentStep(3);

    try {
      const result = await apiPost('/api/storyboard-references/generate', {
        script,
        brief,
        storyboard,
      });

      setReferenceAssets(result.assets || []);
      applyWorkflowMessages(result);
      setReferenceStatus('done');
    } catch (error) {
      setWorkflowMessages([`参考图生成失败：${error.message}`]);
      setReferenceStatus('error');
    }
  };

  const confirmReferenceAssets = () => {
    setReferenceStatus('confirmed');
    setCurrentStep(4);
  };

  const regenerateReferenceAsset = async (asset) => {
    setReferenceStatus('running');

    try {
      const result = await apiPost('/api/storyboard-references/regenerate', {
        asset,
        script,
        brief,
        storyboard,
      });

      setReferenceAssets((prev) => {
        const rest = prev.filter((item) => item.id !== asset.id);
        return [...rest, result.asset].sort((a, b) => a.id.localeCompare(b.id));
      });
      applyWorkflowMessages(result);
      setReferenceStatus('done');
      setStoryboardImages([]);
      setImageStatus('idle');
      setVideoClips([]);
      setVideoStatus('idle');
      setFinalStatus('idle');
      setFinalCut(null);
    } catch (error) {
      setWorkflowMessages([`参考图重新生成失败：${error.message}`]);
      setReferenceStatus('error');
    }
  };

  const runImageGeneration = async () => {
    setImageStatus('running');
    setVideoClips([]);
    setVideoStatus('idle');
    setFinalStatus('idle');
    setFinalCut(null);
    setCurrentStep(4);

    try {
      const result = await apiPost('/api/storyboard-images/generate', {
        script,
        brief,
        storyboard,
        referenceAssets,
      });

      setStoryboardImages(result.images || []);
      applyWorkflowMessages(result);
      setImageStatus('done');
    } catch (error) {
      setWorkflowMessages([`分镜首帧图生成失败：${error.message}`]);
      setImageStatus('error');
    }
  };

  const confirmStoryboardImages = () => {
    setImageStatus('confirmed');
    runVideoGeneration();
  };

  const regenerateShotImage = async (shot) => {
    const currentImage = storyboardImages.find((image) => image.shotId === shot.id);
    setImageStatus('running');

    try {
      const result = await apiPost('/api/storyboard-images/regenerate', {
        shot,
        currentImage,
        script,
        brief,
        storyboard: [shot],
        referenceAssets,
      });

      setStoryboardImages((prev) => {
        const rest = prev.filter((image) => image.shotId !== shot.id);
        return [...rest, result.image].sort((a, b) => a.shotId - b.shotId);
      });
      applyWorkflowMessages(result);
      setImageStatus('done');
      setVideoClips([]);
      setVideoStatus('idle');
      setFinalStatus('idle');
      setFinalCut(null);
    } catch (error) {
      setWorkflowMessages([`分镜首帧图重新生成失败：${error.message}`]);
      setImageStatus('error');
    }
  };

  const runVideoGeneration = async () => {
    setVideoStatus('running');
    setFinalStatus('idle');
    setFinalCut(null);
    setCurrentStep(5);

    try {
      const result = await apiPost('/api/videos/generate', {
        script,
        brief,
        storyboard,
        storyboardImages,
      });

      setVideoClips(result.clips || []);
      applyWorkflowMessages(result);
      setVideoStatus('done');
    } catch (error) {
      setWorkflowMessages([`分镜视频生成失败：${error.message}`]);
      setVideoStatus('error');
    }
  };

  const regenerateVideoClip = async (shot) => {
    const currentClip = videoClips.find((clip) => clip.shotId === shot.id);
    setVideoStatus('running');

    try {
      const result = await apiPost('/api/videos/regenerate', {
        shot,
        currentClip,
        script,
        brief,
        storyboard: [shot],
        storyboardImages,
      });

      setVideoClips((prev) => {
        const rest = prev.filter((clip) => clip.shotId !== shot.id);
        return [...rest, result.clip].sort((a, b) => a.shotId - b.shotId);
      });
      applyWorkflowMessages(result);
      setVideoStatus('done');
      setFinalStatus('idle');
      setFinalCut(null);
    } catch (error) {
      setWorkflowMessages([`分镜视频重新生成失败：${error.message}`]);
      setVideoStatus('error');
    }
  };

  const confirmVideoClips = () => {
    setVideoStatus('confirmed');
    setCurrentStep(6);
  };

  const runFinalGeneration = async () => {
    setFinalStatus('running');
    setCurrentStep(6);

    try {
      const result = await apiPost('/api/final-cuts/generate', {
        script,
        brief,
        storyboard,
        videoClips,
      });

      setFinalCut(result.finalCut || null);
      applyWorkflowMessages(result);
      setFinalStatus('done');
    } catch (error) {
      setWorkflowMessages([`成片生成失败：${error.message}`]);
      setFinalStatus('error');
    }
  };

  const exportProject = () => {
    const project = {
      brief,
      script,
      storyboard,
      referenceAssets,
      storyboardImages,
      videoClips,
      finalCut,
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

      {workflowMessages.length > 0 && (
        <section className="workflow-notices">
          {workflowMessages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </section>
      )}

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
                      {asset.source && <small>来源：{asset.source}</small>}
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
                          <dt>来源</dt>
                          <dd>{shotImage.source}</dd>
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
                          <dt>来源</dt>
                          <dd>{clip.source}</dd>
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
          {videoStatus === 'error' ? (
            <button className="primary-button full" type="button" onClick={runVideoGeneration}>
              重新生成分镜视频
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
                  <small>{finalCut?.outputPath || '字幕 + 配音 + BGM + 转场'}</small>
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

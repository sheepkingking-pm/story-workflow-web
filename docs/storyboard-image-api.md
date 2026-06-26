# Storyboard Image API

当前端完成“确认脚本并拆分镜”后，视觉生成改为两阶段：

```text
1. 调用 script-to-storyboard-image 生成角色图和场景图
2. 用户确认角色图和场景图
3. 再次调用 script-to-storyboard-image，携带已确认参考图，生成每个分镜首帧图
```

## 第一阶段：生成角色图和场景图

```http
POST /api/storyboard-references/generate
Content-Type: application/json
```

### 请求体

```json
{
  "scriptId": "scr_123",
  "skill": "script-to-storyboard-image",
  "model": "seadream5.0",
  "aspectRatio": "9:16",
  "brief": {
    "productName": "多效合一气垫 BB",
    "audience": "25-35 岁通勤女性",
    "sellingPoints": "遮瑕、保湿、持妆、快速补妆",
    "storyStyle": "都市轻喜剧",
    "extraInstruction": "前三秒必须有冲突，商品露出不要硬广",
    "duration": 30,
    "ratio": "9:16"
  },
  "script": "## 抖音剧情带货脚本...",
  "storyboard": []
}
```

### 返回体

```json
{
  "taskId": "ref_task_123",
  "status": "done",
  "skill": "script-to-storyboard-image",
  "model": "seadream5.0",
  "referenceAssets": [
    {
      "id": "character_01",
      "type": "character",
      "name": "女主角色图",
      "usage": "主角一致性",
      "seed": 2026062300,
      "imageUrl": "https://cdn.example.com/storyboard_references/characters/character_01.png",
      "outputPath": "storyboard_references/characters/character_01.png",
      "prompt": "Character reference image...",
      "negativePrompt": "low quality, blurry..."
    },
    {
      "id": "scene_01",
      "type": "scene",
      "name": "办公室洗手间",
      "usage": "钩子与补妆场景",
      "seed": 2026062302,
      "imageUrl": "https://cdn.example.com/storyboard_references/scenes/scene_01.png",
      "outputPath": "storyboard_references/scenes/scene_01.png",
      "prompt": "Scene reference image...",
      "negativePrompt": "low quality, blurry..."
    }
  ]
}
```

用户确认后，前端应保存 `referenceAssets`，后续生成首帧图时完整传回后端。

## 第二阶段：生成分镜首帧图

确认参考图后，点击“生成每个分镜首帧图”时，应调用后端接口：

```http
POST /api/storyboard-images/generate
Content-Type: application/json
```

## 请求体

```json
{
  "scriptId": "scr_123",
  "skill": "script-to-storyboard-image",
  "model": "seadream5.0",
  "aspectRatio": "9:16",
  "brief": {
    "productName": "多效合一气垫 BB",
    "audience": "25-35 岁通勤女性",
    "sellingPoints": "遮瑕、保湿、持妆、快速补妆",
    "storyStyle": "都市轻喜剧",
    "extraInstruction": "前三秒必须有冲突，商品露出不要硬广",
    "duration": 30,
    "ratio": "9:16"
  },
  "script": "## 抖音剧情带货脚本...",
  "referenceAssets": [
    {
      "id": "character_01",
      "type": "character",
      "imageUrl": "https://cdn.example.com/storyboard_references/characters/character_01.png",
      "outputPath": "storyboard_references/characters/character_01.png"
    },
    {
      "id": "scene_01",
      "type": "scene",
      "imageUrl": "https://cdn.example.com/storyboard_references/scenes/scene_01.png",
      "outputPath": "storyboard_references/scenes/scene_01.png"
    }
  ],
  "storyboard": [
    {
      "id": 1,
      "title": "疲惫钩子",
      "duration": 4,
      "scene": "办公室洗手间镜前",
      "camera": "近景，镜面反射，轻微推近",
      "visual": "女主看着暗沉妆面，手机弹出客户会提前提醒。",
      "dialogue": "重要时刻，偏偏状态最差。",
      "product": "商品未出现，制造冲突。",
      "imagePrompt": "vertical frame...",
      "videoPrompt": "woman looks at mirror..."
    }
  ]
}
```

## 后端处理流程

```text
1. 校验 scriptId、script、storyboard、aspectRatio。
2. 校验 referenceAssets 是否已经用户确认。
3. 组装 script-to-storyboard-image 的输入，携带确认后的角色图和场景图。
4. 调用 skill，得到基于参考图的分镜 prompt、负向 prompt。
5. 对每个镜头调用 seadream5.0 生图。
6. 图片上传到对象存储或保存到项目素材目录。
7. 返回 imageTaskId、每个镜头的图片 URL/路径、seed、prompt、状态。
```

## 返回体

```json
{
  "taskId": "img_task_123",
  "status": "done",
  "skill": "script-to-storyboard-image",
  "model": "seadream5.0",
  "visualBible": {
    "style": "真实短视频/商业分镜",
    "character": "25-35 岁通勤女性，白衬衫，低马尾",
    "product": "圆形气垫粉盒，浅色包装",
    "scene": "现代办公室"
  },
  "images": [
    {
      "shotId": 1,
      "model": "seadream5.0",
      "status": "done",
      "seed": 2026062200,
      "imageUrl": "https://cdn.example.com/storyboard/frame_01.png",
      "outputPath": "storyboard_images/frame_01.png",
      "prompt": "Frame 01, 9:16 storyboard key frame...",
      "negativePrompt": "low quality, blurry, distorted face, extra fingers..."
    }
  ]
}
```

## 后端伪代码

```js
app.post('/api/storyboard-images/generate', async (req, res) => {
  const { scriptId, script, storyboard, brief, referenceAssets, aspectRatio = '9:16' } = req.body;

  const storyboardPlan = await runSkill('script-to-storyboard-image', {
    model: 'seadream5.0',
    aspectRatio,
    storyStyle: brief.storyStyle,
    extraInstruction: brief.extraInstruction,
    script,
    storyboard,
    confirmedReferences: referenceAssets,
    product: {
      name: brief.productName,
      sellingPoints: brief.sellingPoints,
      referenceImages: brief.productImages || []
    }
  });

  const images = [];

  for (const shot of storyboardPlan.shots) {
    const image = await callSeadream50({
      model: 'seadream5.0',
      prompt: shot.prompt,
      negative_prompt: shot.negativePrompt,
      aspect_ratio: aspectRatio,
      resolution: aspectRatio === '9:16' ? '1080x1920' : '1024x1024',
      seed: shot.seed
    });

    images.push({
      shotId: shot.shotId,
      model: 'seadream5.0',
      status: 'done',
      seed: shot.seed,
      imageUrl: image.url,
      outputPath: image.outputPath,
      prompt: shot.prompt,
      negativePrompt: shot.negativePrompt
    });
  }

  res.json({
    taskId: `img_${Date.now()}`,
    status: 'done',
    skill: 'script-to-storyboard-image',
    model: 'seadream5.0',
    visualBible: storyboardPlan.visualBible,
    images
  });
});
```

## 前端接入点

正式接后端时，把当前 `mockStoryboardImageApi()` 替换成：

```js
async function generateStoryboardImages(payload) {
  const res = await fetch('/api/storyboard-images/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error('分镜生图失败');
  }

  return res.json();
}
```

## 注意事项

- `script-to-storyboard-image` 负责把脚本和分镜转成视觉设定、分镜 prompt、负向 prompt。
- 第一阶段 `script-to-storyboard-image` 先生成角色图和场景图。
- 用户确认角色图和场景图后，第二阶段才能生成分镜首帧图。
- `seadream5.0` 负责真正生成图片。
- 后端需要保存每个镜头的 `prompt`、`negativePrompt`、`seed`、`imageUrl`，方便重试和复现。
- 商品图作为参考图时，应先上传到对象存储，再把 URL 传给后端生图服务。
- 同一个脚本多次生图建议生成不同 `imageTaskId`，不要覆盖历史结果。

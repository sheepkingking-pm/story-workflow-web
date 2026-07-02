# Online Real Workflow Integration

目标：线上使用时，前端不直接调用本地 Trae skill 或模型，而是统一调用本项目 Node API。Node API 再按配置调用真实 skill 编排服务、Seadream 5.0 和 Seedance 2.0。

## 调用链路

| 工作流步骤 | 前端调用 | 后端优先调用 | 模型 |
| --- | --- | --- | --- |
| 02 脚本确认 | `POST /api/scripts/generate` | `story-script-generator` | 无 |
| 03 参考图确认 | `POST /api/storyboard-references/generate` | `script-to-storyboard-image` | `seadream5.0` |
| 04 分镜首帧图确认 | `POST /api/storyboard-images/generate` | `script-to-storyboard-image` | `seadream5.0` |
| 05 分镜生成 | `POST /api/videos/generate` | `storyboard-video-finisher` | `seedance2.0` |
| 06 成片 | `POST /api/final-cuts/generate` | `storyboard-video-finisher` | 剪辑服务 / `seedance2.0` 产物 |

## 后端集成优先级

1. 脚本：`STORY_SCRIPT_GENERATOR_API_URL`，否则 local adapter。
2. 参考图和首帧图：`STORYBOARD_IMAGE_SKILL_API_URL`，否则 `SEADREAM_API_URL`，否则 local adapter。
3. 分镜视频：`VIDEO_FINISHER_SKILL_API_URL`，否则 `SEEDANCE_API_URL`，否则 local adapter。
4. 成片：`VIDEO_FINISHER_SKILL_API_URL`，否则 local adapter。

local adapter 只用于演示流程，不会真实调用模型。

## 必需环境变量

```bash
STORY_SCRIPT_GENERATOR_API_URL=
STORY_SCRIPT_GENERATOR_API_KEY=

STORYBOARD_IMAGE_SKILL_API_URL=
STORYBOARD_IMAGE_SKILL_API_KEY=

VIDEO_FINISHER_SKILL_API_URL=
VIDEO_FINISHER_SKILL_API_KEY=

SEADREAM_API_URL=
SEADREAM_API_KEY=

SEEDANCE_API_URL=
SEEDANCE_API_KEY=

CORS_ORIGIN=https://your-frontend.example.com
```

如果前端和后端分开部署，前端构建时还需要：

```bash
VITE_API_BASE_URL=https://your-api.example.com
```

## 线上部署建议

GitHub Pages 只能托管静态前端，不能运行 `server/index.js`。真实调用模型时需要把 Node API 部署到支持服务端运行的平台，例如妙搭全栈应用、Vercel/Render/Railway、公司内部 Node 服务或其他容器服务。

部署后验证：

```bash
curl https://your-api.example.com/api/health
```

`integrations` 中对应字段为 `true` 时，说明后端已读取到真实服务配置。

## 模型网关返回约定

Seadream 返回建议包含：

```json
{
  "imageUrl": "https://cdn.example.com/frame_01.png",
  "outputPath": "storyboard_images/frame_01.png",
  "seed": 12345
}
```

Seedance 返回建议包含：

```json
{
  "videoUrl": "https://cdn.example.com/shot_01.mp4",
  "outputPath": "storyboard_videos/shot_01.mp4",
  "seed": 12345,
  "duration": 4
}
```

后端也兼容 `url`、`outputUrl`、`output_url`、`output_path` 等常见字段名。

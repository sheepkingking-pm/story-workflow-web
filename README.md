# Story Workflow Web

剧情成片半自动工作流原型，支持商品理解、脚本确认、参考图确认、分镜首帧图确认、分镜视频生成和成片导出。

## Local Preview

```bash
npm install
npm run dev:api
```

Open a second terminal:

```bash
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:8787`.

If the frontend is deployed separately from the API, configure the API origin at build time:

```bash
export VITE_API_BASE_URL="https://your-api.example.com"
npm run build
```

To call a real script generator service, set:

```bash
export STORY_SCRIPT_GENERATOR_API_URL="https://your-service.example.com/api/scripts/generate"
export STORY_SCRIPT_GENERATOR_API_KEY="optional-token"
export STORYBOARD_IMAGE_SKILL_API_URL="https://your-service.example.com/api/storyboard-image"
export STORYBOARD_IMAGE_SKILL_API_KEY="optional-token"
export VIDEO_FINISHER_SKILL_API_URL="https://your-service.example.com/api/video-finisher"
export VIDEO_FINISHER_SKILL_API_KEY="optional-token"
export SEADREAM_API_URL="https://your-model-gateway.example.com/v1/images/generate"
export SEADREAM_API_KEY="optional-token"
export SEEDANCE_API_URL="https://your-model-gateway.example.com/v1/videos/generate"
export SEEDANCE_API_KEY="optional-token"
npm run dev:api
```

The backend chooses integrations in this order:

1. Script: `STORY_SCRIPT_GENERATOR_API_URL`, then local adapter.
2. Reference images and storyboard frames: `STORYBOARD_IMAGE_SKILL_API_URL`, then `SEADREAM_API_URL`, then local adapter.
3. Shot videos and final cut: `VIDEO_FINISHER_SKILL_API_URL`, then `SEEDANCE_API_URL` for shot videos, then local adapter.

Local adapters only keep the workflow testable. They do not call real models.

## API Routes

- `POST /api/scripts/generate`
- `POST /api/storyboard-references/generate`
- `POST /api/storyboard-references/regenerate`
- `POST /api/storyboard-images/generate`
- `POST /api/storyboard-images/regenerate`
- `POST /api/videos/generate`
- `POST /api/videos/regenerate`
- `POST /api/final-cuts/generate`
- `GET /api/health`

## Online Deployment

GitHub Pages can only host the static frontend. For real skill/model calls, deploy `server/index.js` to a Node-capable service, configure the environment variables above on that service, then build the frontend with `VITE_API_BASE_URL` pointing to that backend.

See `docs/online-real-workflow.md` for the full production call chain and model gateway contracts.

## GitHub Pages

推送到 `main` 分支后，`.github/workflows/deploy-pages.yml` 会自动构建并发布到 GitHub Pages。

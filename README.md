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
npm run dev:api
```

Without `STORY_SCRIPT_GENERATOR_API_URL`, the Node API uses a local adapter that matches the `story-script-generator` input/output shape.

## GitHub Pages

推送到 `main` 分支后，`.github/workflows/deploy-pages.yml` 会自动构建并发布到 GitHub Pages。

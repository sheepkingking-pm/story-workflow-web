# Deploy Node Backend

当前推荐部署方式：把本仓库作为一个 Node Web Service 部署。服务启动后同时提供：

- 前端页面：`dist`
- 后端 API：`/api/*`
- 健康检查：`/api/health`

这样不需要前后端跨域，也不需要给 GitHub Pages 单独配置 `VITE_API_BASE_URL`。

## Render

仓库已包含 `render.yaml`，可以直接在 Render 里选择 Blueprint / Web Service。

配置：

```text
Build Command: npm ci && npm run build
Start Command: npm start
Health Check Path: /api/health
Node Version: 20+
```

必须配置的环境变量见 `.env.example`。

## Railway

从 GitHub 导入仓库后，使用：

```text
Build Command: npm ci && npm run build
Start Command: npm start
```

Railway 会自动注入 `PORT`，本项目会读取 `process.env.PORT`。

## Docker / 内部容器

```bash
docker build -t story-workflow-web .
docker run --rm -p 8787:8787 --env-file .env story-workflow-web
```

然后访问：

```text
http://localhost:8787/api/health
http://localhost:8787
```

## 与 GitHub Pages 的关系

如果使用上面的 Node Web Service，最简单的方式是直接访问 Node 服务域名，不再依赖 GitHub Pages。

如果仍然要保留 GitHub Pages 作为前端入口，需要在 GitHub Actions 构建前端时配置：

```bash
VITE_API_BASE_URL=https://your-node-backend.example.com
```

并在后端设置：

```bash
CORS_ORIGIN=https://your-github-pages-domain.example.com
```

## 上线后验证

```bash
curl https://your-app.example.com/api/health
```

期望返回：

```json
{
  "ok": true,
  "service": "story-workflow-web-api",
  "integrations": {
    "storyScriptGenerator": true,
    "storyboardImageSkill": true,
    "videoFinisherSkill": true,
    "seadream": true,
    "seedance": true
  }
}
```

如果某项是 `false`，说明对应环境变量未配置，接口会降级到 local adapter 或无法真实调用模型。

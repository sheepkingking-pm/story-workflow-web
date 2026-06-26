# Script Generation API

前端脚本生成使用两个独立字段，避免“风格”和“自然语言要求”职责重叠：

```text
storyStyle：候选风格，必须来自前端枚举，和 story-script-generator 支持的剧情类型对齐。
extraInstruction：用户自由输入的约束或剧情梗概，可为空。
```

## 风格枚举

```json
[
  "都市轻喜剧",
  "追妻火葬场",
  "古装宫斗",
  "宫廷斗争",
  "霸道总裁",
  "霸总甜宠",
  "绿茶小三",
  "重生逆袭",
  "重生复仇",
  "悬疑反转",
  "家庭伦理",
  "豪门恩怨",
  "校园青春",
  "青春暗恋",
  "职场逆袭",
  "职场爽剧",
  "喜剧短剧",
  "泰式误会",
  "古装错位",
  "玄幻修仙",
  "末日生存",
  "未来科幻",
  "时间循环",
  "探案解谜",
  "娱乐综艺",
  "直播间反转",
  "闺蜜种草",
  "亲子育儿",
  "银发生活",
  "自动选择",
  "红果短剧爽文"
]
```

这些候选参考了小说与短剧常见类型能力，包括晋江向情感关系、起点向爽文升级、小云雀/红果短剧式高钩子反转等。

## 前端请求

```http
POST /api/scripts/generate
Content-Type: application/json
```

```json
{
  "productName": "多效合一气垫 BB",
  "audience": "25-35 岁通勤女性",
  "sellingPoints": "遮瑕、保湿、持妆、快速补妆",
  "storyStyle": "追妻火葬场",
  "extraInstruction": "前三秒要有误会冲突，女主最后反转打脸，商品露出自然，不要硬广。",
  "duration": 30,
  "ratio": "9:16",
  "productImageUrl": "https://cdn.example.com/product/main.jpg"
}
```

## 后端组装 Skill 输入

```js
async function generateScript(req, res) {
  const brief = req.body;

  const result = await runSkill('story-script-generator', {
    platform: 'douyin',
    duration: brief.duration,
    aspectRatio: brief.ratio,
    product: {
      name: brief.productName,
      audience: brief.audience,
      sellingPoints: brief.sellingPoints,
      imageUrl: brief.productImageUrl
    },
    creative: {
      storyStyle: brief.storyStyle,
      extraInstruction: brief.extraInstruction
    },
    outputFormat: 'json'
  });

  res.json(normalizeScriptResult(result));
}
```

## Prompt 约束

```text
请基于 storyStyle 选择对应剧情结构，不要把 extraInstruction 当作风格分类。
extraInstruction 仅作为补充约束、指定剧情、禁用表达或转化要求。
输出必须包含 scriptMarkdown 和 storyboard JSON。
```

## 返回体

```json
{
  "scriptId": "scr_123",
  "scriptMarkdown": "## 抖音剧情带货脚本...",
  "storyboard": [
    {
      "id": 1,
      "title": "误会钩子",
      "duration": 4,
      "scene": "办公室走廊",
      "visual": "女主被误会状态差，客户会议突然提前。",
      "dialogue": "你现在这样，真的能见客户吗？",
      "product": "商品暂不出现，先制造冲突。",
      "imagePrompt": "vertical frame...",
      "videoPrompt": "camera pushes in..."
    }
  ],
  "warnings": ["避免绝对化功效表达"]
}
```

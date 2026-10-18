// magpie-bilibili-translate — 把 bilibili Index-Translate 免费公共 API 接入 magpie/OpenCode
// 端点与请求细节来自官方脚本: github.com/bilibili/Index-Translate (inference/llm/call_api.py)

const PROVIDER = "bili-translate"
const BASE = "https://index-translate.bilibili.com/v1"
const UA = "Index-Translate-Client/1.0 magpie-bilibili-translate/0.1.0"

// 站点输入限 8000 字符;按 token 保守声明
const CONTEXT_LIMIT = 16384
const OUTPUT_LIMIT = 4096

const MODELS = {
  "Index-Translate-35B-A3B": { name: "Index-Translate 35B (效果最佳)", limit: { context: CONTEXT_LIMIT, output: OUTPUT_LIMIT } },
  "Index-Translate-9B": { name: "Index-Translate 9B (均衡)", limit: { context: CONTEXT_LIMIT, output: OUTPUT_LIMIT } },
  "Index-Translate-2B": { name: "Index-Translate 2B (最快)", limit: { context: CONTEXT_LIMIT, output: OUTPUT_LIMIT } },
}

// 关键点:35B 等推理模型若开启思考,CoT 文本会顶掉正式译文。
// call_api.py 的 OpenAI 兼容桥接代理同样默认强制 enable_thinking=false。
function disableThinking(body) {
  if (typeof body !== "string" || !body) return body
  try {
    const payload = JSON.parse(body)
    if (typeof payload !== "object" || payload === null) return body
    payload.chat_template_kwargs ??= {}
    if (typeof payload.chat_template_kwargs !== "object" || payload.chat_template_kwargs === null) return body
    payload.chat_template_kwargs.enable_thinking ??= false
    return JSON.stringify(payload)
  } catch {
    return body
  }
}

export const BiliTranslatePlugin = async () => ({
  // 供应商声明。免费匿名 API,模型列表不随账号变化,静态声明即可,
  // 故省略 provider.models 钩子(magpie 直接使用 config 中的列表)。
  config: async (cfg) => {
    cfg.provider ??= {}
    cfg.provider[PROVIDER] ??= {
      name: "Bilibili Index-Translate",
      npm: "@ai-sdk/openai-compatible", // chat completions 兼容
      api: BASE,
      models: { ...MODELS },
    }
  },

  auth: {
    provider: PROVIDER,
    // 免费公共 API 无 key;magpie 的账号体系需要一个登录条目,随便填即可。
    methods: [
      {
        type: "api",
        label: "免费 API — 无需 key,随便填一个名字(如 free)",
        placeholder: "free",
      },
    ],
    // 无条件返回 baseURL + fetch:有没有登录都直接可用。
    async loader() {
      return {
        baseURL: BASE,
        async fetch(input, init) {
          const headers = new Headers(init?.headers)
          headers.set("user-agent", UA)
          const body = disableThinking(init?.body)
          return fetch(input, { ...init, headers, body })
        },
      }
    },
  },
})

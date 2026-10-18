// 一次性验证脚本:加载插件,检查 config/auth 钩子与 enable_thinking 注入
import { BiliTranslatePlugin } from './index.mjs'

const p = await BiliTranslatePlugin()

const cfg = {}
await p.config(cfg)
const prov = cfg.provider['bili-translate']
console.log('PROVIDER_OK', prov.api, '|', Object.keys(prov.models).join(', '))

const loader = await p.auth.loader()
console.log('BASEURL_OK', loader.baseURL)

// 拦截 fetch,检查 UA 与请求体注入
let captured
const orig = globalThis.fetch
globalThis.fetch = async (input, init) => {
  captured = {
    url: String(input),
    ua: new Headers(init?.headers).get('user-agent'),
    body: JSON.parse(init?.body),
  }
  return new Response('{}', { status: 200 })
}
await loader.fetch('https://index-translate.bilibili.com/v1/chat/completions', {
  method: 'POST',
  body: JSON.stringify({ model: 'x', messages: [] }),
})
globalThis.fetch = orig

console.log('UA_OK', captured.ua)
console.log('THINKING_OK', JSON.stringify(captured.body.chat_template_kwargs))
console.log('ALL_CHECKS_DONE')

// Note! Setup for Chrome:
// 1. Run Chrome with param: "...\chrome.exe" --remote-debugging-port=9222
// 2. http://127.0.0.1:9222/json/version
// 3. Paste `webSocketDebuggerUrl`:
// (seems to require Chrome Canary, the URL at step 2 didn't work on plain Chrome)
export const wsUrl = "ws://127.0.0.1:9222/devtools/browser/11111111-abab-1111-1b11-111a11aba111";

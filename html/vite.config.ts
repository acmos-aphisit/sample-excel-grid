import react from "@vitejs/plugin-react-swc";
import { defineConfig as defineTestConfig } from "vitest/config";

// Vite + Vitest の設定
export default defineTestConfig({
  plugins: [react()],
  test: {
    globals: true, // `expect` などのグローバル関数を使用可能にする
    environment: "jsdom", // Reactコンポーネントのテスト向け
    setupFiles: "./vitest.setup.ts", // 必要ならセットアップファイルを指定
    reporters: ['verbose'],
    silent : true,
  },
});

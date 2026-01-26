import react from "@vitejs/plugin-react-swc";
import { defineConfig as defineTestConfig } from "vitest/config";

// Vite + Vitest の設定
export default defineTestConfig({
  mode: 'development',
  plugins: [react()],
  test: {
    globals: true, // `expect` などのグローバル関数を使用可能にする
    environment: "jsdom", // Reactコンポーネントのテスト向け
    setupFiles: "./vitest.setup.ts", // 必要ならセットアップファイルを指定
    // Optional: Configure test result export
    reporters: ['default', 'json'], // 'default' for console output, 'json' for JSON file
    outputFile: {
      json: './test-results.json', // Path to the JSON output file
    },
    coverage: {
      reporter: ['text', 'json', 'html'], // For code coverage reports
      // dir: './coverage', // Directory for coverage reports
    },
  },
});




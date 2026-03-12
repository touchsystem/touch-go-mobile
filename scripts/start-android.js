#!/usr/bin/env node

/**
 * Inicia o Metro com redirecionamento de porta para dispositivo Android via USB.
 * Resolve o erro "Unable to load script" quando o app fica preso na splash screen.
 * 
 * Uso: npm run start:android
 * Requisito: dispositivo conectado via USB com depuração USB ativada.
 */

const { execSync, spawn } = require("child_process");

try {
  execSync("adb reverse tcp:8081 tcp:8081", { stdio: "inherit" });
  console.log("✓ Porta 8081 redirecionada para o dispositivo.");
} catch (e) {
  console.warn(
    "⚠ adb reverse ignorado (conecte o dispositivo via USB para hot reload)."
  );
}

const args = process.argv.slice(2);
const env = {
  ...process.env,
  EXPO_NO_DEPENDENCY_VALIDATION: "1",
};
const child = spawn("npx", ["expo", "start", ...args], {
  stdio: "inherit",
  shell: true,
  env,
});

child.on("exit", (code) => process.exit(code ?? 0));

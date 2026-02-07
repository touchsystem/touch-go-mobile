const path = require('path');
const fs = require('fs');
const {
  withDangerousMod,
  withMainApplication,
  withAndroidManifest,
} = require('@expo/config-plugins');

const PACKAGE_NAME = 'com.touchgo.mobile';
const STORAGE_PERMISSIONS = [
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.READ_EXTERNAL_STORAGE',
];
const PLUGIN_DIR = path.join(__dirname, 'smart2-print');

/**
 * Expo config plugin que injeta o módulo nativo Smart2Print no Android:
 * - Adiciona permissões de armazenamento (para PNG acessível pelo PlugPag)
 * - Copia Smart2PrintModule.java e Smart2PrintPackage.java para android/app/src/main/java/com/touchgo/mobile/
 * - Registra Smart2PrintPackage no MainApplication (Kotlin/Java)
 *
 * Uso: adicione "./plugins/with-smart2-print.js" ao array "plugins" no app.json.
 * Depois rode: npx expo prebuild -p android
 *
 * A dependência do PlugPag já deve existir no app (ex.: via PagSeguro Smart 2).
 */
function withSmart2Print(config) {
  // 0) Adicionar permissões de armazenamento (PNG em /sdcard/smart2_print/ para o PlugPag ler)
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    if (!manifest) return config;
    const usesPermissions = manifest['uses-permission'] || [];
    const arr = Array.isArray(usesPermissions) ? usesPermissions : [usesPermissions];
    const existing = arr.map((p) => (typeof p === 'object' && p.$ ? p.$['android:name'] : null)).filter(Boolean);
    for (const perm of STORAGE_PERMISSIONS) {
      if (!existing.includes(perm)) {
        arr.push({ $: { 'android:name': perm } });
      }
    }
    manifest['uses-permission'] = arr;
    return config;
  });

  // 1) Copiar os dois arquivos Java para o projeto Android
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformRoot = config.modRequest.platformProjectRoot;
      const javaDir = path.join(
        platformRoot,
        'app',
        'src',
        'main',
        'java',
        ...PACKAGE_NAME.split('.')
      );

      if (!fs.existsSync(javaDir)) {
        fs.mkdirSync(javaDir, { recursive: true });
      }

      const files = ['Smart2PrintModule.java', 'Smart2PrintPackage.java'];
      for (const file of files) {
        const src = path.join(PLUGIN_DIR, file);
        const dest = path.join(javaDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log(`[with-smart2-print] Copied ${file} to ${dest}`);
        } else {
          console.warn(`[with-smart2-print] Source not found: ${src}`);
        }
      }

      return config;
    },
  ]);

  // 2) Registrar Smart2PrintPackage no MainApplication
  config = withMainApplication(config, (config) => {
    let content = config.modResults.contents;
    if (typeof content !== 'string') {
      return config;
    }

    if (content.includes('Smart2PrintPackage()')) {
      return config;
    }

    // Inserir add(Smart2PrintPackage()) após add(PagSeguroSmart2Package()) ou após o primeiro add(...) no bloco packages.apply
    const afterPagSeguro = 'add(PagSeguroSmart2Package())';
    const afterDeviceSerial = 'add(DeviceSerialPackage())';
    const newLine = 'add(Smart2PrintPackage())';

    if (content.includes(afterPagSeguro)) {
      content = content.replace(
        afterPagSeguro + '',
        afterPagSeguro + '\n              ' + newLine
      );
    } else if (content.includes(afterDeviceSerial)) {
      content = content.replace(
        afterDeviceSerial + '',
        afterDeviceSerial + '\n              ' + newLine
      );
    } else {
      // Fallback: após "packages.apply {" inserir na próxima linha
      content = content.replace(
        /(packages\.apply\s*\{\s*)/,
        `$1\n              ${newLine}\n              `
      );
    }

    config.modResults.contents = content;
    return config;
  });

  return config;
}

module.exports = withSmart2Print;

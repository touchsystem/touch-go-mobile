const path = require('path');
const fs = require('fs');
const {
  withDangerousMod,
  withMainApplication,
  withAndroidManifest,
  withProjectBuildGradle,
  withAppBuildGradle,
} = require('@expo/config-plugins');

const PACKAGE_NAME = 'com.touchgo.mobile';
const STORAGE_PERMISSIONS = [
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.READ_EXTERNAL_STORAGE',
];
const PLUGIN_DIR = path.join(__dirname, 'smart2-print');
const PLUGPAG_MAVEN_URL = 'https://github.com/pagseguro/PlugPagServiceWrapper/raw/master';
const PLUGPAG_DEPENDENCY = "implementation 'br.com.uol.pagseguro.plugpagservice.wrapper:wrapper:1.33.0'";

/**
 * Expo config plugin que injeta o módulo nativo Smart2Print no Android:
 * - Adiciona repositório Maven e dependência do PlugPag SDK
 * - Adiciona permissões de armazenamento (para PNG acessível pelo PlugPag)
 * - Copia Smart2PrintModule.java e Smart2PrintPackage.java para android/app/src/main/java/com/touchgo/mobile/
 * - Registra Smart2PrintPackage no MainApplication (Kotlin/Java)
 *
 * Uso: adicione "./plugins/with-smart2-print.js" ao array "plugins" no app.json.
 * Depois rode: npx expo prebuild -p android
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

  // 1) Adicionar repositório Maven do PlugPag no build.gradle raiz (allprojects.repositories)
  config = withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    if (typeof contents !== 'string') return config;
    const mavenBlock = `maven { url '${PLUGPAG_MAVEN_URL}' }`;
    if (contents.includes(PLUGPAG_MAVEN_URL)) return config;
    // Inserir em allprojects.repositories (após mavenCentral, antes do jitpack)
    contents = contents.replace(
      /(allprojects\s*\{\s*repositories\s*\{[\s\S]*?)mavenCentral\(\)\s*\n(\s*maven\s*\{\s*url\s*'https:\/\/www\.jitpack\.io'\s*\})/,
      `$1mavenCentral()\n        ${mavenBlock}\n        $2`
    );
    config.modResults.contents = contents;
    return config;
  });

  // 2) Adicionar dependência do PlugPag no app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    if (typeof contents !== 'string') return config;
    if (contents.includes('plugpagservice.wrapper')) return config;
    // Inserir após implementation("com.facebook.react:react-android")
    contents = contents.replace(
      /implementation\("com\.facebook\.react:react-android"\)\s*\n/,
      `implementation("com.facebook.react:react-android")\n    ${PLUGPAG_DEPENDENCY}\n`
    );
    config.modResults.contents = contents;
    return config;
  });

  // 3) Copiar os dois arquivos Java para o projeto Android
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

  // 4) Registrar Smart2PrintPackage no MainApplication
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

const path = require('path');
const fs = require('fs');
const {
  withDangerousMod,
  withMainApplication,
  withAndroidManifest,
} = require('@expo/config-plugins');

const PACKAGE_NAME = 'com.touchgo.mobile';
const PLUGIN_DIR = path.join(__dirname, 'pagseguro-smart2');

/**
 * Expo config plugin que injeta o módulo nativo PagSeguroSmart2 (pagamento) no Android.
 * - Adiciona permissão MANAGE_PAYMENTS
 * - Copia PagSeguroSmart2Module.java, PagSeguroSmart2Package.java, PagSeguroHelper.java
 * - Registra PagSeguroSmart2Package no MainApplication
 *
 * A dependência PlugPag (wrapper) é injetada pelo plugin with-smart2-print.
 * Adicione este plugin ANTES do with-smart2-print no app.json.
 */
function withPagSeguroSmart2(config) {
  // 0) Permissão MANAGE_PAYMENTS
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    if (!manifest) return config;
    const usesPermissions = manifest['uses-permission'] || [];
    const arr = Array.isArray(usesPermissions) ? usesPermissions : [usesPermissions];
    const existing = arr.map((p) => (typeof p === 'object' && p.$ ? p.$['android:name'] : null)).filter(Boolean);
    const perm = 'br.com.uol.pagseguro.permission.MANAGE_PAYMENTS';
    if (!existing.includes(perm)) {
      arr.push({ $: { 'android:name': perm } });
    }
    manifest['uses-permission'] = arr;
    return config;
  });

  // 1) Copiar arquivos Java
  config = withDangerousMod(config, [
    'android',
    async (config) => {
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

      const files = ['PagSeguroHelper.java', 'PagSeguroSmart2Module.java', 'PagSeguroSmart2Package.java'];
      for (const file of files) {
        const src = path.join(PLUGIN_DIR, file);
        const dest = path.join(javaDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log('[with-pagseguro-smart2] Copied ' + file);
        } else {
          console.warn('[with-pagseguro-smart2] Source not found: ' + src);
        }
      }

      return config;
    },
  ]);

  // 2) Registrar PagSeguroSmart2Package no MainApplication (Java ou Kotlin)
  config = withMainApplication(config, (config) => {
    let content = config.modResults.contents;
    if (typeof content !== 'string') return config;

    if (content.includes('PagSeguroSmart2Package()')) return config;

    const newLine = 'add(PagSeguroSmart2Package())';
    const afterDeviceSerial = 'add(DeviceSerialPackage())';

    // Kotlin: val packages = PackageList(this).packages ... return packages
    if (content.includes('PackageList(this).packages')) {
      content = content.replace(
        /(val packages = PackageList\(this\)\.packages)\s*\n/,
        '$1\n            packages.add(PagSeguroSmart2Package())\n            '
      );
    } else if (content.includes(afterDeviceSerial)) {
      content = content.replace(
        afterDeviceSerial + '',
        afterDeviceSerial + '\n              ' + newLine
      );
    } else {
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

module.exports = withPagSeguroSmart2;

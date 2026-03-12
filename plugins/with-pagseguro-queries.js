const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

/**
 * Expo config plugin para adicionar queries Android necessárias para comunicação
 * com o PlugPagService do PagSeguro Smart 2.
 * 
 * Android 11+ requer que apps declarem explicitamente quais outros apps/serviços
 * eles querem interagir usando <queries> no AndroidManifest.xml.
 * 
 * Sem isso, o AppsFilter bloqueia a comunicação e aparece o erro:
 * "Unable to start service Intent { cmp=br.com.uol.pagseguro.plugpagservice/.payment.PlugPagService } U=0: not found"
 */
const withPagSeguroQueries = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    // O manifest do Expo tem a estrutura: { manifest: { ... } }
    const manifest = androidManifest.manifest;
    if (!manifest) {
      console.warn('[withPagSeguroQueries] No manifest found');
      return config;
    }

    // Encontra ou cria o elemento <queries>
    // Pode já existir com outros elementos (como <intent>)
    let queriesElement;

    if (!manifest.queries) {
      // Cria novo elemento queries
      queriesElement = {};
      manifest.queries = [queriesElement];
    } else {
      // Usa o elemento queries existente
      if (!Array.isArray(manifest.queries)) {
        manifest.queries = [manifest.queries];
      }
      if (manifest.queries.length === 0) {
        queriesElement = {};
        manifest.queries.push(queriesElement);
      } else {
        queriesElement = manifest.queries[0];
      }
    }

    // Inicializa o array de packages se não existir
    if (!queriesElement.package) {
      queriesElement.package = [];
    }
    if (!Array.isArray(queriesElement.package)) {
      queriesElement.package = [queriesElement.package];
    }

    // Pacotes que precisam ser consultáveis
    const packagesToAdd = [
      'br.com.uol.pagseguro.plugpagservice',
      'br.com.uol.pagseguro.plugpag.libterminal.appservice',
    ];

    // Obtém lista de pacotes já declarados
    const existingPackageNames = queriesElement.package
      .map((pkg) => {
        if (typeof pkg === 'string') return pkg;
        // Pode ser um objeto com $ ou diretamente com android:name
        return pkg.$?.['android:name'] || pkg.$?.name || pkg['android:name'] || null;
      })
      .filter(Boolean);

    // Adiciona pacotes que ainda não estão declarados
    packagesToAdd.forEach((packageName) => {
      if (!existingPackageNames.includes(packageName)) {
        queriesElement.package.push({
          $: {
            'android:name': packageName,
          },
        });
        console.log(`[withPagSeguroQueries] Added package query: ${packageName}`);
      } else {
        console.log(`[withPagSeguroQueries] Package query already exists: ${packageName}`);
      }
    });

    return config;
  });
};

/**
 * Adiciona um provider placeholder para evitar o aviso do manifest merger
 * "FileSystemFileProvider@android:authorities was tagged to replace but no other declaration present".
 * O expo-file-system usa tools:replace="android:authorities" - ao declararmos o provider no app,
 * há algo para substituir.
 */
const withFileSystemProviderPlaceholder = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    if (!manifest?.application) return config;

    const mainApp = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    const providers = mainApp.provider || [];
    const providerList = Array.isArray(providers) ? providers : [providers];
    const hasFileSystemProvider = providerList.some(
      (p) => p.$?.['android:name']?.includes('FileSystemFileProvider') || p.$?.['android:name'] === 'expo.modules.filesystem.FileSystemFileProvider'
    );
    if (hasFileSystemProvider) return config;

    // O expo-file-system declara .FileSystemFileProvider com authorities="${applicationId}.FileSystemFileProvider"
    // Adicionar um provider com authorities que será substituído pelo expo-file-system
    providerList.push({
      $: {
        'android:name': 'expo.modules.filesystem.FileSystemFileProvider',
        'android:authorities': '${applicationId}.FileSystemFileProvider',
        'android:exported': 'false',
        'android:grantUriPermissions': 'true',
      },
    });
    mainApp.provider = providerList;
    return config;
  });
};

const withPagSeguroQueriesAndManifestFixes = (config) => {
  config = withPagSeguroQueries(config);
  config = withFileSystemProviderPlaceholder(config);
  return config;
};

module.exports = withPagSeguroQueriesAndManifestFixes;

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');
const sharedSrc = path.resolve(monorepoRoot, 'shared/src');

const config = getDefaultConfig(projectRoot);

// Watch the shared package in the monorepo
config.watchFolders = [monorepoRoot];

// Resolve packages from both mobile and monorepo root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Remap @gympal/shared imports to shared/src and resolve .js → .ts
const originalResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Redirect @gympal/shared to shared/src
  if (moduleName === '@gympal/shared') {
    return { filePath: path.join(sharedSrc, 'index.ts'), type: 'sourceFile' };
  }

  // When resolving files inside shared/src, remap .js extensions to .ts
  if (context.originModulePath.startsWith(sharedSrc)) {
    const tsPath = moduleName.replace(/\.js$/, '.ts');
    if (tsPath !== moduleName) {
      const resolved = path.resolve(path.dirname(context.originModulePath), tsPath);
      if (fs.existsSync(resolved)) {
        return { filePath: resolved, type: 'sourceFile' };
      }
    }
  }

  if (originalResolver) {
    return originalResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

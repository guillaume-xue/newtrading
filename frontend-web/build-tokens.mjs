import fs from 'node:fs';
import path from 'node:path';

// 1. Charger les JSON
const primitives = JSON.parse(fs.readFileSync('./tokens/primitives.json', 'utf8'));
const light = JSON.parse(fs.readFileSync('./tokens/light.json', 'utf8'));
const dark = JSON.parse(fs.readFileSync('./tokens/dark.json', 'utf8'));

// Helper pour résoudre les chemins type "color.neutral.800"
function getValueByPath(obj, pathStr) {
  const cleanPath = pathStr.replace(/[{}]/g, '');
  const parts = cleanPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current?.$value ?? current;
}

// Fonction récursive pour aplatir et résoudre les tokens
function resolveTokens(node, context) {
  const result = {};

  function traverse(current, currentKey = '') {
    if (!current || typeof current !== 'object') return;

    if ('$value' in current) {
      let val = current.$value;
      // Si la valeur est un alias comme "{color.neutral.100}"
      if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
        val = getValueByPath(context, val) ?? val;
      }
      result[currentKey] = val;
      return;
    }

    for (const [key, val] of Object.entries(current)) {
      // Ignorer les métadonnées Figma
      if (key.startsWith('$')) continue;
      const nextKey = currentKey ? `${currentKey}_${key}` : key;
      traverse(val, nextKey);
    }
  }

  traverse(node);
  return result;
}

// 2. Résolution des thèmes
const combinedContext = { ...primitives, ...light, ...dark };
const resolvedLight = resolveTokens(light, combinedContext);
const resolvedDark = resolveTokens(dark, combinedContext);
const resolvedPrimitives = resolveTokens(primitives, combinedContext);

// 3. Écriture du dossier de sortie
const outDir = './src/theme/generated';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outDir, 'light.ts'),
  `export const lightColors = ${JSON.stringify(resolvedLight, null, 2)} as const;\n`
);

fs.writeFileSync(
  path.join(outDir, 'dark.ts'),
  `export const darkColors = ${JSON.stringify(resolvedDark, null, 2)} as const;\n`
);

fs.writeFileSync(
  path.join(outDir, 'primitives.ts'),
  `export const primitives = ${JSON.stringify(resolvedPrimitives, null, 2)} as const;\n`
);

console.log('✓ Tokens générés avec succès dans src/theme/generated/ !');

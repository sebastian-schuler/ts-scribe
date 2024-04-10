import { toCamelCase } from './to-camel-case';
import { toPascalCase } from './to-pascal-case';
import { toSnakeCase } from './to-snake-case';
import { toKebabCase } from './to-kebab-case';
import { toHeaderCase } from './to-header-case';
import { toDotCase } from './to-dot-case';

/**
 * A collection of string utilities.
 */
export const StringUtils = {
  camelCase: toCamelCase,
  pascalCase: toPascalCase,
  snakeCase: toSnakeCase,
  kebabCase: toKebabCase,
  headerCase: toHeaderCase,
  dotCase: toDotCase,
};

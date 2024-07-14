import { toCamelCase, toDotCase, toHeaderCase, toKebabCase, toPascalCase, toSnakeCase } from '../../src/string';

describe('String conversion functions', () => {
  describe('toCamelCase', () => {
    it('converts simple sentences', () => {
      expect(toCamelCase('hello world')).toBe('helloWorld');
    });
    it('handles single words', () => {
      expect(toCamelCase('world')).toBe('world');
    });
    it('handles empty strings', () => {
      expect(toCamelCase('')).toBe('');
    });
    it('handles special characters', () => {
      expect(toCamelCase('hello-world')).toBe('helloWorld');
    });
    it('handle scrambled data', () => {
      expect(toCamelCase('adaio.asd.a:D:')).toBe('adaioAsdAD');
    });
  });

  describe('toDotCase', () => {
    it('converts simple sentences', () => {
      expect(toDotCase('hello world')).toBe('hello.world');
    });
    it('handles single words', () => {
      expect(toDotCase('world')).toBe('world');
    });
    it('handles empty strings', () => {
      expect(toDotCase('')).toBe('');
    });
    it('handles special characters', () => {
      expect(toDotCase('hello-world')).toBe('hello.world');
    });
    it('handle scrambled data', () => {
      expect(toDotCase('adaio.asd.a:D:')).toBe('adaio.asd.a.d');
    });
  });

  describe('toHeaderCase', () => {
    it('converts simple sentences', () => {
      expect(toHeaderCase('hello world')).toBe('Hello World');
    });
    it('handles single words', () => {
      expect(toHeaderCase('world')).toBe('World');
    });
    it('handles empty strings', () => {
      expect(toHeaderCase('')).toBe('');
    });
    it('handles special characters', () => {
      expect(toHeaderCase('hello-world')).toBe('Hello World');
    });
    it('handle scrambled data', () => {
      expect(toHeaderCase('adaio.asd.a:D:')).toBe('Adaio Asd A D');
    });
  });

  describe('toKebabCase', () => {
    it('converts simple sentences', () => {
      expect(toKebabCase('hello world')).toBe('hello-world');
    });
    it('handles single words', () => {
      expect(toKebabCase('world')).toBe('world');
    });
    it('handles empty strings', () => {
      expect(toKebabCase('')).toBe('');
    });
    it('handles special characters', () => {
      expect(toKebabCase('hello_world')).toBe('hello-world');
    });
    it('handle scrambled data', () => {
      expect(toKebabCase('adaio.asd.a:D:')).toBe('adaio-asd-a-d');
    });
  });

  describe('toPascalCase', () => {
    it('converts simple sentences', () => {
      expect(toPascalCase('hello world')).toBe('HelloWorld');
    });
    it('handles single words', () => {
      expect(toPascalCase('world')).toBe('World');
    });
    it('handles empty strings', () => {
      expect(toPascalCase('')).toBe('');
    });
    it('handles special characters', () => {
      expect(toPascalCase('hello-world')).toBe('HelloWorld');
    });
    it('handle scrambled data', () => {
      expect(toPascalCase('adaio.asd.a:D:')).toBe('AdaioAsdAD');
    });
  });

  describe('toSnakeCase', () => {
    it('converts simple sentences', () => {
      expect(toSnakeCase('hello world')).toBe('hello_world');
    });
    it('handles single words', () => {
      expect(toSnakeCase('world')).toBe('world');
    });
    it('handles empty strings', () => {
      expect(toSnakeCase('')).toBe('');
    });
    it('handles special characters', () => {
      expect(toSnakeCase('hello-world')).toBe('hello_world');
    });
    it('handle scrambled data', () => {
      expect(toSnakeCase('adaio.asd.a:D:')).toBe('adaio_asd_a_d');
    });
  });
});

import { describe, expect, it } from 'bun:test';
import { strCamelCase, strDotCase, strHeaderCase, strKebabCase, strPascalCase, strSnakeCase } from '../../src/index.js';

describe('String conversion functions', () => {
  describe('strCamelCase', () => {
    it('converts simple sentences', () => {
      expect(strCamelCase('hello world')).toBe('helloWorld');
    });
    it('handles single words', () => {
      expect(strCamelCase('world')).toBe('world');
    });
    it('handles empty strings', () => {
      expect(strCamelCase('')).toBe('');
    });
    it('handles special characters', () => {
      expect(strCamelCase('hello-world')).toBe('helloWorld');
    });
    it('handle scrambled data', () => {
      expect(strCamelCase('adaio.asd.a:D:')).toBe('adaioAsdAD');
    });
    it('handle undefined', () => {
      expect(strCamelCase(undefined)).toBe('');
    });
  });

  describe('strDotCase', () => {
    it('converts simple sentences', () => {
      expect(strDotCase('hello world')).toBe('hello.world');
    });
    it('handles single words', () => {
      expect(strDotCase('world')).toBe('world');
    });
    it('handles empty strings', () => {
      expect(strDotCase('')).toBe('');
    });
    it('handles special characters', () => {
      expect(strDotCase('hello-world')).toBe('hello.world');
    });
    it('handle scrambled data', () => {
      expect(strDotCase('adaio.asd.a:D:')).toBe('adaio.asd.a.d');
    });
    it('handle undefined', () => {
      expect(strDotCase(undefined)).toBe('');
    });
  });

  describe('strHeaderCase', () => {
    it('converts simple sentences', () => {
      expect(strHeaderCase('hello world')).toBe('Hello World');
    });
    it('handles single words', () => {
      expect(strHeaderCase('world')).toBe('World');
    });
    it('handles empty strings', () => {
      expect(strHeaderCase('')).toBe('');
    });
    it('handles special characters', () => {
      expect(strHeaderCase('hello-world')).toBe('Hello World');
    });
    it('handle scrambled data', () => {
      expect(strHeaderCase('adaio.asd.a:D:')).toBe('Adaio Asd A D');
    });
    it('handle undefined', () => {
      expect(strHeaderCase(undefined)).toBe('');
    });
  });

  describe('strKebabCase', () => {
    it('converts simple sentences', () => {
      expect(strKebabCase('hello world')).toBe('hello-world');
    });
    it('handles single words', () => {
      expect(strKebabCase('world')).toBe('world');
    });
    it('handles empty strings', () => {
      expect(strKebabCase('')).toBe('');
    });
    it('handles special characters', () => {
      expect(strKebabCase('hello_world')).toBe('hello-world');
    });
    it('handle scrambled data', () => {
      expect(strKebabCase('adaio.asd.a:D:')).toBe('adaio-asd-a-d');
    });
    it('handle undefined', () => {
      expect(strKebabCase(undefined)).toBe('');
    });
  });

  describe('strPascalCase', () => {
    it('converts simple sentences', () => {
      expect(strPascalCase('hello world')).toBe('HelloWorld');
    });
    it('handles single words', () => {
      expect(strPascalCase('world')).toBe('World');
    });
    it('handles empty strings', () => {
      expect(strPascalCase('')).toBe('');
    });
    it('handles special characters', () => {
      expect(strPascalCase('hello-world')).toBe('HelloWorld');
    });
    it('handle scrambled data', () => {
      expect(strPascalCase('adaio.asd.a:D:')).toBe('AdaioAsdAD');
    });
    it('handle undefined', () => {
      expect(strPascalCase(undefined)).toBe('');
    });
  });

  describe('toSnakeCase', () => {
    it('converts simple sentences', () => {
      expect(strSnakeCase('hello world')).toBe('hello_world');
    });
    it('handles single words', () => {
      expect(strSnakeCase('world')).toBe('world');
    });
    it('handles empty strings', () => {
      expect(strSnakeCase('')).toBe('');
    });
    it('handles special characters', () => {
      expect(strSnakeCase('hello-world')).toBe('hello_world');
    });
    it('handle scrambled data', () => {
      expect(strSnakeCase('adaio.asd.a:D:')).toBe('adaio_asd_a_d');
    });
    it('handle undefined', () => {
      expect(strSnakeCase(undefined)).toBe('');
    });
  });
});

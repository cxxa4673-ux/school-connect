import { describe, it, expect } from 'vitest';
import {
  normalizeId,
  getRoleFromId,
  isValidIdFormat,
  roleTokenToUserRole,
  validateLinkedId,
} from '../validate';

describe('validate: normalizeId', () => {
  it('trims and uppercases', () => {
    expect(normalizeId('  sc-stu-4821 ')).toBe('SC-STU-4821');
  });
  it('handles non-strings safely', () => {
    expect(normalizeId('' as any)).toBe('');
    expect(normalizeId(undefined as any)).toBe('');
  });
});

describe('validate: format', () => {
  it('accepts valid IDs', () => {
    expect(isValidIdFormat('SC-STU-4821')).toBe(true);
    expect(isValidIdFormat('SC-PAR-1102')).toBe(true);
    expect(isValidIdFormat('SC-TCH-3120')).toBe(true);
    expect(isValidIdFormat('SC-INS-9001')).toBe(true);
  });
  it('rejects malformed / wrong IDs', () => {
    expect(isValidIdFormat('abc')).toBe(false);
    expect(isValidIdFormat('STU-4821')).toBe(false);
    expect(isValidIdFormat('SC-STU-48210')).toBe(false);
    expect(isValidIdFormat('SC-XXX-1234')).toBe(false);
    expect(isValidIdFormat('SC-STU-ABCD')).toBe(false);
  });
});

describe('validate: role extraction', () => {
  it('extracts the role token', () => {
    expect(getRoleFromId('SC-STU-4821')).toBe('STU');
    expect(getRoleFromId('SC-INS-9001')).toBe('INS');
  });
  it('returns null for invalid role tokens', () => {
    expect(getRoleFromId('SC-ZZZ-1234')).toBeNull();
  });
  it('maps token to user role', () => {
    expect(roleTokenToUserRole('STU')).toBe('student');
    expect(roleTokenToUserRole('INS')).toBe('institution_admin');
    expect(roleTokenToUserRole(null)).toBeNull();
  });
});

describe('validate: link linking', () => {
  const directory = ['SC-STU-4821', 'SC-STU-4822'];

  it('rejects empty input', () => {
    const r = validateLinkedId('', { expected: 'STU', directory });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/enter/i);
  });

  it('rejects malformed format', () => {
    const r = validateLinkedId('12345', { expected: 'STU', directory });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/invalid/i);
  });

  it('rejects wrong role type', () => {
    const r = validateLinkedId('SC-PAR-1102', { expected: 'STU', directory });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/not the type/i);
  });

  it('rejects unknown ID in demo mode', () => {
    const r = validateLinkedId('SC-STU-9999', { expected: 'STU', directory });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/does not exist/i);
  });

  it('accepts a valid, known student ID', () => {
    const r = validateLinkedId('SC-STU-4821', { expected: 'STU', directory });
    expect(r.valid).toBe(true);
  });
});

/**
 * Pure validation helpers for School-Connect IDs.
 *
 * These are deliberately framework-free so they are trivial to unit test and
 * can be reused by the UI, the data layer, and (eventually) the server.
 *
 * A valid School-Connect ID looks like:   SC-STU-4821
 *                                      └─┬─┘ └┬┘ └┬┘
 *                                    prefix role  4 digits
 *
 * Roles that may appear in an ID:
 *   STU = student, PAR = parent, TCH = teacher, INS = institution.
 */

export type ScIdRole = 'STU' | 'PAR' | 'TCH' | 'INS';

const ROLE_PREFIXES: Record<ScIdRole, string> = {
  STU: 'student',
  PAR: 'parent',
  TCH: 'teacher',
  INS: 'institution_admin',
};

/** Normalize any typed ID: trim + uppercase. Safe on non-strings. */
export function normalizeId(raw: string): string {
  return String(raw || '').trim().toUpperCase();
}

/** Extract the role token (STU/PAR/TCH/INS) from an ID, or null. */
export function getRoleFromId(raw: string): ScIdRole | null {
  const match = normalizeId(raw).match(/^SC-([A-Z]{3})-\d{4}$/);
  if (!match) return null;
  const role = match[1] as ScIdRole;
  return role in ROLE_PREFIXES ? role : null;
}

/** True if the string matches the School-Connect ID pattern. */
export function isValidIdFormat(raw: string): boolean {
  return /^SC-(STU|PAR|TCH|INS)-\d{4}$/.test(normalizeId(raw));
}

/** Map an ID role token to the matching UserRole value, or null. */
export function roleTokenToUserRole(token: ScIdRole | null): string | null {
  return token ? ROLE_PREFIXES[token] : null;
}

/** Alias used by the validator message builder. */
const roleToUserRole = (token: ScIdRole | null): string | null => roleTokenToUserRole(token);

/**
 * Validate a user-supplied linked ID.
 * @param raw       the ID typed by the user
 * @param expected  (optional) restrict to a specific role (e.g. 'STU' for a parent linking a child)
 * @param directory (optional) known valid IDs; in demo mode we validate against this.
 * @returns success flag + a human readable message (shown to the user, never the internals).
 */
export function validateLinkedId(
  raw: string,
  options?: { expected?: ScIdRole; directory?: string[] }
): { valid: boolean; message: string } {
  const id = normalizeId(raw);

  if (!id) return { valid: false, message: 'Please enter a School-Connect ID.' };

  if (!isValidIdFormat(id)) {
    return {
      valid: false,
      message: 'Invalid ID format. Expected SC-XXX-1234 (e.g. SC-STU-4821).',
    };
  }

  const role = getRoleFromId(id);
  if (options?.expected && role !== options.expected) {
    return {
      valid: false,
      message: `This is a ${roleToUserRole(role)} ID — not the type you are trying to link.`,
    };
  }

  // In demo mode, cross-check against the known directory when provided.
  if (options?.directory && options.directory.length > 0) {
    const known = normalizeId(id);
    if (!options.directory.some((d) => normalizeId(d) === known)) {
      return { valid: false, message: 'This ID does not exist. Please verify and try again.' };
    }
  }

  return { valid: true, message: 'ID verified successfully.' };
}

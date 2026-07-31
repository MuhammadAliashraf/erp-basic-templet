import type { AuthUser } from '@/features/auth';
import type { ExampleRecord } from '@/pages/design-system/example-records.api';

/** Seed data for the mock API. Development only. */

export const MOCK_USER: AuthUser = {
  id: 'usr_000000000001',
  email: 'admin@example.com',
  name: 'Alex Morgan',
  title: 'Platform Administrator',
  roles: ['admin'],
  // `*` grants everything, which is what makes every nav item visible in the demo.
  permissions: ['*'],
};

export const MOCK_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password',
} as const;

const FIRST_NAMES = [
  'Amina', 'Bilal', 'Chen', 'Daniel', 'Elena', 'Farah', 'Gabriel', 'Hana',
  'Ibrahim', 'Julia', 'Karim', 'Lena', 'Mateo', 'Nadia', 'Omar', 'Priya',
  'Rafael', 'Sofia', 'Tariq', 'Uma', 'Viktor', 'Wei', 'Yusuf', 'Zara',
];

const LAST_NAMES = [
  'Ahmed', 'Bergström', 'Chowdhury', 'Delacroix', 'Eriksson', 'Fernandez',
  'Gupta', 'Haddad', 'Ivanov', 'Johansson', 'Khan', 'Lindqvist', 'Moreau',
  'Nakamura', 'Okafor', 'Petrov', 'Quintero', 'Rossi', 'Silva', 'Tanaka',
];

const DEPARTMENTS = [
  'Operations', 'Finance', 'Engineering', 'Compliance',
  'Human Resources', 'Procurement', 'Customer Success',
];

const STATUSES: ExampleRecord['status'][] = ['active', 'active', 'active', 'pending', 'suspended', 'archived'];

/**
 * Deterministic pseudo-random generator.
 *
 * A fixed seed means the fixture set is identical on every reload, so the demo
 * data does not shuffle underneath you while you are looking at it.
 */
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

function generateRecords(count: number): ExampleRecord[] {
  const random = createSeededRandom(20260801);
  const now = Date.now();

  return Array.from({ length: count }, (_, index) => {
    const first = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    const name = `${first} ${last}`;

    return {
      id: `rec_${String(index + 1).padStart(6, '0')}`,
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
      department: DEPARTMENTS[Math.floor(random() * DEPARTMENTS.length)],
      status: STATUSES[Math.floor(random() * STATUSES.length)],
      updatedAt: new Date(now - Math.floor(random() * 90) * 86_400_000).toISOString(),
    };
  });
}

export const MOCK_RECORDS: ExampleRecord[] = generateRecords(137);

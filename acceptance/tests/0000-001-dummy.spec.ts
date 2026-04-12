import { describe, it } from '@std/testing/bdd';
import { expect } from 'playwright/test';
import { setupAcceptanceTest } from './testSetup.ts';
import { assertExists } from '@std/assert';

const dsl = setupAcceptanceTest();

describe('0000-001: Dummy', () => {
  it('should create a new user account', () => {
    assertExists(dsl.identityAndAccess);

    expect(true).toBe(true);
  });
});

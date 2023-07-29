import { expect, test } from '@playwright/test';
import type { Program } from '@prisma/client';

interface GetAvailableProgramDataExpectedReturnType {
  catalogs: string[];
  startYears: string[];
  programData: Program[];
}

test.describe('getAvailableProgramData tests', () => {
  test('hit route and get data', async ({ request }) => {
    const res = await request.get('/api/data/getAvailableProgramData');
    const resData = (await res.json()) as GetAvailableProgramDataExpectedReturnType;

    expect(res.status()).toBe(200);
    expect(resData).toHaveProperty('catalogs');
    expect(resData).toHaveProperty('startYears');
    expect(resData).toHaveProperty('programData');
    expect(resData.catalogs.length).toBeTruthy();
    expect(resData.startYears.length).toBeTruthy();
    expect(resData.programData.length).toBeTruthy();
  });

  // TODO: add 500 case
});

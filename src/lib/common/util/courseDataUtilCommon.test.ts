import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import { getCatalogFromProgramIDIndex } from '$lib/common/util/courseDataUtilCommon';

// init API data
await apiDataConfig.init();

describe('courseDataUtilCommon tests', () => {
  test('valid catalog with one program', () => {
    const catalog = getCatalogFromProgramIDIndex(
      0,
      ['d38fef1b-990b-4cce-a82c-79d55879f4be'],
      apiDataConfig.apiData.programData
    );
    expect(catalog).toBe('2022-2026');
  });

  test('valid catalog with two programs', () => {
    const programs = [
      '1c3a7751-0eb8-4652-b316-0307f1db312f',
      '0e7e23c6-aeee-418d-93f7-5ba3475ab00b'
    ];
    expect(getCatalogFromProgramIDIndex(0, programs, apiDataConfig.apiData.programData)).toBe(
      '2019-2020'
    );
    expect(getCatalogFromProgramIDIndex(1, programs, apiDataConfig.apiData.programData)).toBe(
      '2020-2021'
    );
  });

  test('valid catalog with max number of programs', () => {
    const programs = [
      '1c3a7751-0eb8-4652-b316-0307f1db312f',
      '0e7e23c6-aeee-418d-93f7-5ba3475ab00b',
      '3f289773-7b54-4d99-8e03-48c829b63636',
      '10ee525b-780d-4aa8-8a91-be6498c89937',
      'bf13b9db-acc0-4967-bd9e-f123693652e5'
    ];
    expect(getCatalogFromProgramIDIndex(4, programs, apiDataConfig.apiData.programData)).toBe(
      '2019-2020'
    );
    expect(getCatalogFromProgramIDIndex(2, programs, apiDataConfig.apiData.programData)).toBe(
      '2015-2017'
    );
  });

  test('undefined catalog', () => {
    const programs = [
      '1c3a7751-0eb8-4652-b316-0307f1db312f',
      '0e7e23c6-aeee-418d-93f7-5ba3475ab00b',
      '3f289773-7b54-4d99-8e03-48c829b63636',
      '10ee525b-780d-4aa8-8a91-be6498c89937',
      'bf13b9db-acc0-4967-bd9e-f123693652e5'
    ];
    expect(
      getCatalogFromProgramIDIndex(-1, programs, apiDataConfig.apiData.programData)
    ).toBeUndefined();
    expect(
      getCatalogFromProgramIDIndex(5, programs, apiDataConfig.apiData.programData)
    ).toBeUndefined();
    expect(getCatalogFromProgramIDIndex(3, programs, [])).toBeUndefined();
  });
});

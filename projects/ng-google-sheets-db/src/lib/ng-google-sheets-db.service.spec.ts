/* tslint:disable:no-string-literal */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { NgGoogleSheetsDbService } from './ng-google-sheets-db.service';
import { googleSheetsMockResponseData } from './ng-google-sheets-db.service.mock-data';

describe('NgGoogleSheetsDbService', () => {
  let service: NgGoogleSheetsDbService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(NgGoogleSheetsDbService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert column names', () => {
    expect(service.getJsonColumnName('test')).toBe('test');
    expect(service.getJsonColumnName('  test  ')).toBe('test');
    expect(service.getJsonColumnName('test-2')).toBe('test-2');
    expect(service.getJsonColumnName('test_2')).toBe('test2');
    expect(service.getJsonColumnName('test 2')).toBe('test2');
    expect(service.getJsonColumnName('  As_dö1+l-?r#^2  t=e*s$t  ')).toBe('asdö1l-r2test');
    expect(service.getJsonColumnName(' AbCdEfghij klMNOPqrstuvWxYZ^1234567890ß´+#-.,<>;:_*`?=) (/&%$§' +
      '"!° @end  ')).toBe('abcdefghijklmnopqrstuvwxyz1234567890ß-.end');
  });

  const attributesMapping = {
    id: 'ID',
    name: 'Name',
    email: 'Email Address',
    contact: {
      _prefix: 'Contact',
      street: 'Street',
      streetNumber: 'Street Number',
      zip: 'ZIP',
      city: 'City'
    },
    skills: {
      _prefix: 'Skill',
      _listField: true
    }
  };

  it('should read Google sheet and return all entries', (done: DoneFn) => {
    service.get('1gSc_7WCmt-HuSLX01-Ev58VsiFuhbpYVo8krbPCvvqA', 1, attributesMapping)
      .subscribe(data => {
        expect(data.length).toBe(5);

        expect(data[0]['id']).toBe('1');
        expect(data[0]['name']).toBe('Lisa');
        expect(data[0]['email']).toBe('lisa.s@test.com');
        expect(data[0]['contact']['street']).toBe('Evergreen Terrace');
        expect(data[0]['contact']['streetNumber']).toBe('742');
        expect(data[0]['contact']['zip']).toBe('58008');
        expect(data[0]['contact']['city']).toBe('Springfield');
        expect(data[0]['skills'].length).toBe(3);
        expect(data[0]['skills']).toContain('saxophone');
        expect(data[0]['skills']).toContain('art');
        expect(data[0]['skills']).toContain('science');
        expect(data[0]['isactive']).toBeFalsy();
        expect(data[0]['notvisible']).toBeFalsy();

        done();
    });

    const expectedRequestUrl = 'https://spreadsheets.google.com/feeds/list/1gSc_7WCmt-HuSLX01-Ev58VsiFuhbpYVo8krbPCvvqA/1/public/values?alt=json';
    const mockRequest: TestRequest = httpMock.expectOne(expectedRequestUrl);
    mockRequest.flush(googleSheetsMockResponseData);
  });

  it('should read Google sheet and return active entries', (done: DoneFn) => {
    service.getActive('1gSc_7WCmt-HuSLX01-Ev58VsiFuhbpYVo8krbPCvvqA', 2, attributesMapping, 'Active')
      .subscribe(data => {
        expect(data.length).toBe(3);

        expect(data[0]['id']).toBe('2');
        expect(data[0]['name']).toBe('Marge');
        expect(data[0]['email']).toBe('');
        expect(data[0]['contact']['street']).toBe('Evergreen Terrace');
        expect(data[0]['contact']['streetNumber']).toBe('742');
        expect(data[0]['contact']['zip']).toBe('58008');
        expect(data[0]['contact']['city']).toBe('Springfield');
        expect(data[0]['skills'].length).toBe(2);
        expect(data[0]['skills']).toContain('painting');
        expect(data[0]['skills']).toContain('bowling');
        expect(data[0]['isactive']).toBeFalsy();
        expect(data[0]['notvisible']).toBeFalsy();

        expect(data[2]['skills']).toEqual([]);

        done();
    });

    const expectedRequestUrl = 'https://spreadsheets.google.com/feeds/list/1gSc_7WCmt-HuSLX01-Ev58VsiFuhbpYVo8krbPCvvqA/2/public/values?alt=json';
    const mockRequest: TestRequest = httpMock.expectOne(expectedRequestUrl);
    mockRequest.flush(googleSheetsMockResponseData);
  });
});

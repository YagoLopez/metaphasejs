import {getUrlParameter, updateQueryStringParameter} from "../src/orm/yago.logger";


describe('Logger', () => {

  describe('● getUrlParameter()', () => {

    test('Fn is defined', () => {
      expect(getUrlParameter).toBeDefined();
    });

    test('Mock url is defined', () => {
      expect(location.href).toBe('http://localhost/?param1=value1&param2=');
    });

    test('(1) Parameter arg: name is defined and value is defined', () => {
      expect(getUrlParameter('param1')).toBe('value1');
    });

    test('(2) Parameter arg: name is defined and value is undefined', () => {
      console.log('getUrlParameter(param2)', getUrlParameter('param2'));
      expect(getUrlParameter('param2')).toBe('');
    });

  });

  describe('● updateQueryStringParameter()', () => {

    test('Fn is defined', () => {
      expect(updateQueryStringParameter).toBeDefined();
    });

    test('Parameter name and value are defined', () => {
      let url = 'http://localhost/?param1=value1';
      url = updateQueryStringParameter(url, 'param1', 'value2');
      expect(url).toBe('http://localhost/?param1=value2');
    });

    test('Parameter name is defined and initial value is undefined', () => {
      let url = 'http://localhost/?param1=';
      url = updateQueryStringParameter(url, 'param1', 'value2');
      expect(url).toBe('http://localhost/?param1=value2');
    });

  });

});
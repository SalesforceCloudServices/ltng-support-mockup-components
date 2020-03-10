/* eslint-disable @lwc/lwc/no-inner-html */

/** JEST Test for ltng_mockupCsvParser/__tests__/ltng_mockupCsvParser **/

import ltng_mockupCsvParser, {splitRows, nextCsvCell, nextCsvStringCell, parseCsvLine, parseCsvToLabelValue, LabelValue, ResponsiveTableData, parseCSV} from 'c/ltng_mockupCsvParser';
import { isArray } from 'util'; // eslint-disable-line no-unused-vars

const tableTestInfo = {
  csv: `"FirstName", LastName, "Age" , Color
Eve,"Jackson", 94, Red
Rob, Mite, 24, Blue
Bob, Parr, 42, Red`,
  expectedRowSplit: [
    `"FirstName", LastName, "Age" , Color`,
    `Eve,"Jackson", 94, Red`,
    `Rob, Mite, 24, Blue`,
    `Bob, Parr, 42, Red`
  ],
  expectedTable: [
    ['FirstName', 'LastName', 'Age', 'Color'],
    [`Eve`, `Jackson`, `94`, `Red`],
    [`Rob`, `Mite`, `24`, `Blue`],
    [`Bob`, `Parr`, `42`, `Red`]
  ],
  expectedData: new ResponsiveTableData(
    ['FirstName', 'LastName', 'Age', 'Color'],
    [
      [
        new LabelValue('FirstName', 'Eve'),
        new LabelValue('LastName', 'Jackson'),
        new LabelValue('Age', '94'),
        new LabelValue('Color', 'Red')
      ],
      [
        new LabelValue('FirstName', 'Rob'),
        new LabelValue('LastName', 'Mite'),
        new LabelValue('Age', '24'),
        new LabelValue('Color', 'Blue')
      ],
      [
        new LabelValue('FirstName', 'Bob'),
        new LabelValue('LastName', 'Parr'),
        new LabelValue('Age', '42'),
        new LabelValue('Color', 'Red')
      ]
    ]
  )
};

describe('c-ltng_mockupCsvParser', () => {
  it('all imports are found', () => {
    expect(ltng_mockupCsvParser).toBeTruthy();
    expect(splitRows).toBeTruthy();
    expect(nextCsvCell).toBeTruthy();
    expect(nextCsvStringCell).toBeTruthy();
    expect(parseCsvLine).toBeTruthy();
  });

  describe('split', () => {
    it('splits the rows', () => {
      const rowSplit = splitRows(tableTestInfo.csv);
      expect(rowSplit).toStrictEqual(tableTestInfo.expectedRowSplit);
    });
    it('splits correctly even if there is only one line', () => {
      expect(splitRows('single line')).toStrictEqual(['single line']);
    });
    it('splits rows even if the newlines are escaped', () => {
      const str = 'Row, Header A, Header B\n1, 1:A, 1:B\n2, 2:A, 2:B';
      const result = splitRows(str);
      const expected = ['Row, Header A, Header B',
        '1, 1:A, 1:B',
        '2, 2:A, 2:B'
      ];

      expect(result).toStrictEqual(expected);
    })
  });

  describe('tokenizes when there are no quotes', () => {
    it('and the value cannot be found', () => {
      var csvLine = null;
      var csvParse = null
      var expected = null;

      csvLine = '    ';
      csvParse = nextCsvCell(csvLine);
      expected = null;
  
      expect(csvParse).toBeNull();

      csvLine = ' , two, three';
      csvParse = nextCsvCell(csvLine);
      expected = ['', 'two, three'];
  
      expect(csvParse).toStrictEqual(expected);
    });

    it('and the value is easily found', () => {
      var csvLine = null;
      var csvParse = nextCsvCell(csvLine);
      var expected = null;

      csvLine = '  one  ';
      csvParse = nextCsvCell(csvLine);
      expected = ['one', null];

      expect(csvParse).toStrictEqual(expected);

      csvLine = '  one, two, three';
      csvParse = nextCsvCell(csvLine);
      expected = ['one', 'two, three'];

      expect(csvParse).toStrictEqual(expected);
    });
  });

  describe('tokenizes the row when there are quotes', () => {
    it('and the quotes are missing', () => {
      var csvLine = null;
      var csvParse = null;
      var expected = null;

      csvLine = '    ';
      csvParse = nextCsvStringCell(csvLine);
      expected = null;

      expect(csvParse).toStrictEqual(expected);
  
      csvLine = '  one  ';
      csvParse = nextCsvStringCell(csvLine);
      expected = null;

      expect(csvParse).toStrictEqual(expected);

      csvLine = '  one , two  ';
      csvParse = nextCsvStringCell(csvLine);
      expected = null;
  
      expect(csvParse).toStrictEqual(expected);

      csvLine = ' , two, three';
      csvParse = nextCsvStringCell(csvLine);
      expected = null;
  
      expect(csvParse).toStrictEqual(expected);
    });

    it('and the quotes are messed up', () => {
      var csvLine = null;
      var csvParse = null;
      var expected = null;

      csvLine = '  "one  ';
      csvParse = nextCsvStringCell(csvLine);
      expected = null;

      expect(csvParse).toStrictEqual(expected);

      csvLine = '  "one, two ';
      csvParse = nextCsvStringCell(csvLine);
      expected = null;
  
      expect(csvParse).toStrictEqual(expected);
    });

    it('and there are quotes in the string', () => {
      var csvLine = null;
      var csvParse = null;
      var expected = null;

      csvLine = ' "she said \\"over here!\\""';
      csvParse = nextCsvStringCell(csvLine);
      expected = ['she said "over here!"',null];
  
      expect(csvParse).toStrictEqual(expected);
    });

    it('and the value is easily found', () => {
      var csvLine = null;
      var csvParse = null;
      var expected = null;

      csvLine = '  "one"  ';
      csvParse = nextCsvStringCell(csvLine);
      expected = ['one',null];

      expect(csvParse).toStrictEqual(expected);

      csvLine = '  "one", two  ';
      csvParse = nextCsvStringCell(csvLine);
      expected = ['one','two'];

      expect(csvParse).toStrictEqual(expected);

      csvLine = '  "one", "two"  ';
      csvParse = nextCsvStringCell(csvLine);
      expected = ['one','"two"'];

      expect(csvParse).toStrictEqual(expected);

      csvLine = '  "one", two, three';
      csvParse = nextCsvStringCell(csvLine);
      expected = ['one', 'two, three'];

      expect(csvParse).toStrictEqual(expected);
    });
  });

  describe('parses a csv line into all values', () => {
    it('and the value isnt clear', () => {
      var csvLine = null;
      var csvParse = null;
      var expected = [];

      csvLine = '    ';
      csvParse = parseCsvLine(csvLine);
      expected = [];

      expect(csvParse).toStrictEqual(expected);
      
      csvLine = ' , two, three';
      csvParse = parseCsvLine(csvLine);
      expected = ['', 'two','three'];
  
      expect(csvParse).toStrictEqual(expected);
      
    });

    it('when there are no quotes', () => {
      var csvLine = null;
      var csvParse = null;
      var expected = [];

      csvLine = '  one  ';
      csvParse = parseCsvLine(csvLine);
      expected = ['one'];

      expect(csvParse).toStrictEqual(expected);

      csvLine = '  one , two  ';
      csvParse = parseCsvLine(csvLine);
      expected = ['one', 'two'];
  
      expect(csvParse).toStrictEqual(expected);
    });

    it('when there are quotes', () => {
      var csvLine = null;
      var csvParse = null;
      var expected = [];

      csvLine = '  "one"  ';
      csvParse = parseCsvLine(csvLine);
      expected = ['one'];

      expect(csvParse).toStrictEqual(expected);

      csvLine = '  "one", two  ';
      csvParse = parseCsvLine(csvLine);
      expected = ['one','two'];
  
      expect(csvParse).toStrictEqual(expected);

      csvLine = '  "one", two, three';
      csvParse = parseCsvLine(csvLine);
      expected = ['one', 'two', 'three'];
  
      expect(csvParse).toStrictEqual(expected);
    });

    it('when the quotes are messed up', () => {
      var csvLine = null;
      var csvParse = null;
      var expected = [];

      csvLine = '  "one  ';
      csvParse = parseCsvLine(csvLine);
      expected = ['"one'];
  
      expect(csvParse).toStrictEqual(expected);

      csvLine = '  "one, two ';
      csvParse = parseCsvLine(csvLine);
      expected = ['"one', 'two'];
  
      expect(csvParse).toStrictEqual(expected);
    });
  });

  describe('parses csv string into a table', () => {
    it('when the csv is invalid', () => {
      let csv;
      let csvParse;
      let expected;

      csv = '';
      csvParse = ltng_mockupCsvParser(csv);
      expected = [];

      expect(csvParse).toStrictEqual(expected);
    });

    it('when the csv is valid', () => {
      let csv;
      let csvParse;
      let expected;

      csv = tableTestInfo.csv;
      csvParse = ltng_mockupCsvParser(csv);
      expected = tableTestInfo.expectedTable;

      expect(csvParse).toStrictEqual(expected);
    });
  });

  describe('converts a csv to label values', () => {
    it('when the data is invalid', () => {
      let csv;
      let csvParse;
      let expected;

      csv = '';
      csvParse = parseCsvToLabelValue(csv);
      expected = new ResponsiveTableData();

      expect(csvParse).toStrictEqual(expected);
    });
    it('when the data is valid', () => {
      let csv;
      let csvParse;

      csv = tableTestInfo.csv;
      csvParse = parseCsvToLabelValue(csv);
      const expected = tableTestInfo.expectedData;

      expect(csvParse).toBeTruthy();
      expect(csvParse.headers).toStrictEqual(expected.headers);

      expect(csvParse.data).not.toBeNull();
      expect(csvParse.data.length).toStrictEqual(expected.data.length);
      expect(JSON.stringify(csvParse.data)).toStrictEqual(JSON.stringify(expected.data));
    });

    it('can use escaped newlines for tables', () => {
      let csv = 'Row, Header A, Header B\n1, 1:A, 1:B\n2, 2:A, 2:B';
      let csvParse = parseCSV(csv);
      let expected = [['Row', 'Header A', 'Header B'], ['1', '1:A', '1:B'], ['2', '2:A', '2:B']];

      expect(csvParse).toStrictEqual(expected);
    });
  });
});
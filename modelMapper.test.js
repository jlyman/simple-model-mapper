import expect from 'expect';
import { mapModelToApi, mapApiToModel } from './modelMapper';

function TestModel(data) {
  this.testElement = data ? data.testElement : 'WRONG1';
  this.nestedElement = data ? data.nestedElement : 'WRONG2';
}

const exampleTestModel = new TestModel({
  testElement: 'GOOD1',
  nestedElement: {
    nestedElement1: 'GOOD2',
    nestedElement2: 'GOOD3',
  },
});

const apiResponse = {
  test_element: 'GOOD1',
  nested_element_1: 'GOOD2',
  nested_element_2: 'GOOD3',
};

const mapping = [
  ['testElement', 'test_element'],
  [
    'nestedElement',
    apiObj => ({
      nestedElement: {
        nestedElement1: apiObj.nested_element_1,
        nestedElement2: apiObj.nested_element_2,
      },
    }),
    modelObj => ({
      nested_element_1: modelObj.nestedElement.nestedElement1,
      nested_element_2: modelObj.nestedElement.nestedElement2,
    }),
  ],
];

describe('Model mapper functions', () => {
  describe('Model --> API response', () => {
    it('should map basic elements directly', () => {
      const result = mapModelToApi(exampleTestModel, mapping);

      expect(result).toHaveProperty('test_element');
      expect(result.test_element).toBe(exampleTestModel.testElement);
    });

    it('should map nested elements correctly', () => {
      const result = mapModelToApi(exampleTestModel, mapping);

      expect(result).toHaveProperty('nested_element_1');
      expect(result).toHaveProperty('nested_element_2');
      expect(result.nested_element_1).toBe(
        exampleTestModel.nestedElement.nestedElement1
      );
      expect(result.nested_element_2).toBe(
        exampleTestModel.nestedElement.nestedElement2
      );
    });
  });
  describe('API Response --> Model', () => {
    it('should map basic elements directly', () => {
      const result = mapApiToModel(apiResponse, mapping, TestModel);

      expect(result).toHaveProperty('testElement');
      expect(result.testElement).toBe(apiResponse.test_element);
    });

    it('should map flat properties to nested elements', () => {
      const result = mapApiToModel(apiResponse, mapping, TestModel);

      expect(result).toHaveProperty('nestedElement');
      expect(result.nestedElement).toHaveProperty('nestedElement1');
      expect(result.nestedElement).toHaveProperty('nestedElement2');
      expect(result.nestedElement.nestedElement1).toBe(
        apiResponse.nested_element_1
      );
      expect(result.nestedElement.nestedElement2).toBe(
        apiResponse.nested_element_2
      );
    });

    it('should return an object of the correct prototype', () => {
      const result = mapApiToModel(apiResponse, mapping, TestModel);

      expect(result).toBeInstanceOf(TestModel);
    });
  });
});

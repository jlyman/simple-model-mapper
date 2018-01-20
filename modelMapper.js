import assign from 'lodash/assign';

/**
 * Converts one type of object to another, in this case to/from our Models to
 * plain API response objects.
 * @param {object} sourceObj The source object, either a Model or a plain API response object
 * @param {array} mapping An array of arrays, the inner arrays containing key mappings between objects.
 *                        Inner array format can be either ['modelPropertyKey', ['apiPropertyKey'] or
 *                        ['modelPropertyKey', apiToModelTransformer(), modelToApiTransformer()]
 * @param {bool} isMappingModelToApi True if we are taking a Model object an
 *                                   mapping to an API response object, otherwise false.
 */
function mappingReducer(sourceObj, mapping, isMappingModelToApi) {
  const sourceMapIndex = isMappingModelToApi ? 0 : 1;
  const targetMapIndex = isMappingModelToApi ? 1 : 0;
  const lambdaMapIndex = isMappingModelToApi ? 2 : 1;

  // Iterate through each element of the `mapping` object,
  // and map the source property to the target property.
  return mapping.reduce((targetObj, mapEl) => {
    if (mapEl.length === 3) {
      // We are using mapping functions to generate the result.
      // Process and Object.assign the result.
      if (mapEl[lambdaMapIndex] !== null) {
        const result = mapEl[lambdaMapIndex](sourceObj);
        assign(targetObj, result);
      }
    } else {
      // Just a simple straight mapping conversion.
      targetObj[mapEl[targetMapIndex]] = sourceObj[mapEl[sourceMapIndex]];
    }

    return targetObj;
  }, {});
}

/**
 * Converts a Model to an API response object
 * @param {object} model The model to convert to a POJO
 * @param {array} modelMap An array of arrays, the inner arrays containing key mappings between objects.
 *                         Inner array format can be either ['modelPropertyKey', ['apiPropertyKey'] or
 *                         ['modelPropertyKey', apiToModelTransformer(), modelToApiTransformer()]
 */
export function mapModelToApi(model, modelMap) {
  return mappingReducer(model, modelMap, true);
}

/**
 * Converts a plain API response object to a Model.
 * @param {object} apiObject The API response to convert to a Model
 * @param {array} modelMap An array of arrays, the inner arrays containing key mappings between objects.
 *                         Inner array format can be either ['modelPropertyKey', ['apiPropertyKey'] or
 *                         ['modelPropertyKey', apiToModelTransformer(), modelToApiTransformer()]
 * @param {Prototype} modelPrototype The type of model we are creating (e.g., User)
 */
export function mapApiToModel(apiObject, modelMap, modelPrototype) {
  const data = mappingReducer(apiObject, modelMap, false);
  return new modelPrototype(data);
}

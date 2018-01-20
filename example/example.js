import User, { userToApiMap } from './User.js';
import { mapModelToApi, mapApiToModel } from '../modelMapper.js';

const apiResponse = {
  id: 123,
  userName: 'Bob',
  user_perms: [
    'admin',
    'update',
  ],
};

const modelExample = new User({
  id: 456,
  username: 'Joe',
  isAdmin: true,
  permissions: ['read', 'delete'],
});

console.log('Mapping out the following API response to a User POJO model:\n', apiResponse);
const convertedModel = mapApiToModel(apiResponse, userToApiMap, User);
console.log('\nResulting User model:\n', convertedModel);

console.log('\n\nMapping out this User model to an API object:\n', modelExample);
const apiObject = mapModelToApi(modelExample, userToApiMap);
console.log('\nResulting API object:\n', apiObject);

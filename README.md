# Simple Javscript Model Mapper Utility Functions

This small collection of methods make it easier to map between the data structure returned from or sent to and API, and a correspondingly equivalent Javascript object model.

Given an API response object you can turn it into a Javascript model by calling `mapApiToModel(apiResponse, modelMap, ModelType)`, or go the other direction by calling `mapModelToApi(model, modelMap)`.

## Motivation

I often find myself in situations where a project has a model both on the server and on the client, transferred via an API, but with ever so slight differences between the two that preclude just using a straight reading of the JSON or `JSON.stringify()`. Sometimes the API `snake_cases` the properties, or sometimes a property is collapsed into one coming from the API, but needs to be split into different properties on the client.

Because this concern occurs again and again, it makes sense to centralize the translation of API response object <==> Javascript object model, standardize it, and pull it out so the right part of your application can have concern over it.

## Example

Say we have a very simple User model on both the client and server, which looks like the following in JS:

```
User {
  id: 83924,
  username: 'george',
  isAdmin: false,
  permissions: ['read', 'update'],
}
```

But coming from the API, the response JSON looks like this:

```
{
  "id": 83924,
  "username": "george",
  "user_perms": [
    "read",
    "update",
  ],
}
```

Note the casing is different, `isAdmin` is missing, and `permissions` is represented as `user_perms`. You can't just all `JSON.parse(apiResponse)` on this to get your User model in JS.

Instead, we can build a quick bi-directional mapping of properties between the two, and then call the appropriate mapper function in these utility functions to translate to the desired object.

### Properties Map

For our User model, the mapping is an array of arrays, each child array representing a mapping of a property. The array can either be two strings, providing a one-to-one map between JS property name and API name, or a string and two functions, providing a JS property name and a function to map the API object to the model, and the third vice versa. 

Here's the map for our User model:

```
const userToApiMap = [
  ['id', 'id'],
  ['username', 'userName'],
  ['isAdmin',
    apiObj => {
      const isAdmin = apiObj.user_perms.indexOf('admin') !== -1;
      const permissions = apiObj.user_perms.filter(p => p !== 'admin');
      return {
        isAdmin,
        permissions,
      };
    },
    modelObj => {
      return {
        user_perms: modelObj.permissions.concat(modelObj.isAdmin && ['admin']),
      };
    }
  ]
]
```

Note that `id` and `username` are super straightforward; they're just a one-to-one mapping of a simple property, with `username` just having a little different casing.

But `isAdmin` and `permissions` on the client are more involved. To determine if a user is an admin (boolean), we have to see if there is an `admin` string in the `user_perms` array. And we want our `permissions` array (client-side) to have all permissions _except_ for `'admin'`, if present. So we write two small functions to translate between the two.

The return value of these functions gets concatenated in with the rest of the object, so we can return more than one property and they will all be placed on the target object. (This also means that, even though they are inside of an array targeting `isAdmin`, nothing will by default be assigned to `isAdmin` if you don't return it.)

### Performing the mapping.

Now that we have our mapping between the two defined, we can quickly perform the translation by using two of the utility methods defined: `mapModelToApi()` and `mapApiToModel()`.

#### `mapModelToApi`

`mapModelToApi(model, modelMap)`

* `model`: The model to convert to a POJO
* `modelMap`: The mapping array for the model

Passing in an instance of the User model previously defined, as well as the map, will return a POJO version of the mapped model.

`mapModelToApi(userModel, userToApiMap) => { id: 83924, userName: 'george', user_perms: [ 'read', 'update' ] }`

#### `mapApiToModel`

`mapApiToModel(apiObject, modelMap, modelPrototype)`

* `apiObject`: The object from the API, already parsed from JSON into an object
* `modelMap`: The mapping array for the model
* `modelPrototype`: The type of model we are creating, so a new instance of it is returned at the end

Passing in the object from the API and asking it to map to the defined Javascript model looks like this:

```
mapApiToModel(apiResponse, userToApiMap, User) => object  User {
  id: 83924,
  username: 'george',
  isAdmin: false,
  permissions: [ 'read', 'update' ]
}
```

## FAQs

### Where do I put the mapping array?

I usually place it alongside the Javascript model, like so:

```
export default function User(data) {
  this.id = data && data.id ? data.id : 0;
  ...
}

export const userToApiMap = [
  ['id', 'id'],
  ...
}
```

Then when needed, I can import just the default User model export, or I can grab both with `import User, { userToApiMap } from './User'`.

However, the map can be palced anywhere. If you'd rather separate these concerns you can place the map any place in your application.

### Why are you pulling in lodash?

Browser compatibility is the only reason. I use lodash's `assign` method in place of `Object.assign` only for IE compatibility, but if passing your code through Babel or similar, you likely don't need to use lodash's method. 

### The second form of mapping options, using mapper functions, confuses me

Here's what the signature for the second form should look like, when you can't do a straight one-to-one transfer of the property:

`['modelPropertyKey', apiToModelTransformer(), modelToApiTransformer()]`

Both of the transformer functions take one parameter, either the API object or the model object, and expect in return an object with appropriately named properties to merge in.

To be honest, the `modelPropertyKey` is really just there for developer convenience, to keep track of what part of the model you're addressing here. You _must_ return an object that will be `Object.assign`'ed into the target object from either of your functions, and often it will just be an object with the right property name addressed in `modelPropertyKey`.

This form is a little confusing, but it's powerful. In our example earlier, we create a lambda function that, given an API object, looks for the presence of `'admin'` in the `user_perms` array, and if it finds that, sets `isAdmin` to true and removes it from the array before passing both back in one object. This object gets merged into the final User model.

Likewise, when going from model to API object, it takes the model as a parameter, and produces the `user_perms` array with `'admin'` present if need be, combining both properties down into one that is returned in the object.

Walk through the source to understand this a bit better.

### Where's the NPM package?

This is literally just 23 lines of code and while there are certainly NPM packages with fewer lines, I'm pretty sure anyone that wants to use this will find just as much if not more utility doing a direct copy-and-paste into their project. 

While built to be flexible enough to be used across a variety of projects, it's also strongly possible you'll want to customize this as well, so no need to fork an NPM package for that. :)

## Run the example code

In the source there is an `example` directory, containing a super simple example similar to what is walked through here. Clone the repo and run `npm run example` to see the mapping translation performed, and step through the code to better understand it.

---

Written by Joshua Lyman, https://www.joshualyman.com. Licensed under MIT license.
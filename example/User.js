// Our User model used in this example
export default function User(data) {
  this.id = data && data.id ? data.id : 0;
  this.username = data && data.username ? data.username : '';
  this.isAdmin = data && data.isAdmin ? data.isAdmin : false;
  this.permissions = data && data.permissions ? data.permissions : [];
}

export const userToApiMap = [
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
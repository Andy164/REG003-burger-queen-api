const Role = require('../models/Role');
const User = require('../models/User');

module.exports.initRoles = async () => {
  try {
    const documentCount = await Role.estimatedDocumentCount();

    if (documentCount) return;

    await Promise.all([new Role({ name: 'admin' }).save(), new Role({ name: 'chef' }).save(), new Role({ name: 'waiter' }).save()]);
  } catch (error) {
    console.error('Desde createRoles: ', error);
  }
};

module.exports.initAdminUser = async (app) => {
  try {
    const { adminEmail, adminPassword } = app.get('config');

    const user = await User.findOne({ email: adminEmail });

    if (!user) {
      const roles = await Role.find({ name: { $in: ['admin'] } });

      const adminUser = {
        username: 'admin',
        name: 'Administrador',
        email: adminEmail,
        password: await User.encryptPassword(adminPassword, 10),
        roles,
      };

      await User.create(adminUser);
    }
  } catch (error) {
    return error;
  }
};

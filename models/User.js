const { Schema, model } = require('mongoose');

const bcrypt = require('bcrypt');

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    roles: [
      {
        ref: 'Role',
        type: Schema.Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
    // versionKey: false,
    // eslint-disable-next-line comma-dangle
  }
);

userSchema.statics.encryptPassword = async (password) => {
  // Aplicar algoritmo
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  return hash;
};

userSchema.statics.comparePassword = async (password, receivedPassword) => bcrypt.compare(password, receivedPassword);

module.exports = model('User', userSchema);

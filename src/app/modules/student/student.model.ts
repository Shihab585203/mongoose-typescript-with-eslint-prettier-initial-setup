import { Schema, model } from 'mongoose';
import {
  Guardian,
  LocalGuardian,
  StudentStaticModel,
  TStudent,
  UserName,
} from './student.interface';
import validator from 'validator';
import bcrypt from 'bcrypt';
import config from '../../index';

const userNameValidationSchema = new Schema<UserName>({
  firstName: {
    type: String,
    trim: true,
    required: [true, 'First Name is Required'],
    max: [15, "First Name can't be more than 15 character."],
    validate: {
      validator: function (value: string) {
        const firstNameStr =
          value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        return firstNameStr === value;
      },
      message: '{VALUE} is not capitalize',
    },
  },
  middleName: {
    type: String,
  },
  lastName: {
    type: String,
    trim: true,
    required: [true, 'Last Name is Required'],
    validate: {
      validator: function (value: string) {
        return validator.isAlpha(value);
      },
      message: '{VALUE} is not valid',
    },
  },
});

const guardianValidationSchema = new Schema<Guardian>({
  fatherName: { type: String, required: true },
  fatherOccupation: { type: String, required: true },
  fatherContactNo: { type: String, required: true },
  motherName: { type: String, required: true },
  motherOccupation: { type: String, required: true },
  motherContactNo: { type: String, required: true },
});

const localGuardianValidationSchema = new Schema<LocalGuardian>({
  name: { type: String, required: true },
  occupation: { type: String, required: true },
  contactNo: { type: String, required: true },
  address: { type: String, required: true },
});

const studentValidationSchema = new Schema<TStudent, StudentStaticModel>({
  id: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: [true, 'Password is required'],
    max: [20, 'Password cannot be more than 20 character'],
  },
  name: {
    type: userNameValidationSchema,
    required: [true, 'Name is Required'],
  },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female', 'other'],
      message: '{VALUE} is not valid',
    },
    required: true,
  },
  dateOfBirth: { type: String },
  email: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => {
        return validator.isEmail(value);
      },
      message: '{VALUE} is not a valid email type',
    },
  },
  contactNo: { type: String, required: true },
  emergencyContactNo: { type: String, required: true },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  presentAddress: { type: String, required: true },
  permanentAddress: { type: String, required: true },
  guardian: {
    type: guardianValidationSchema,
    required: [true, 'Guardian Name is Required'],
  },
  localGuardian: {
    type: localGuardianValidationSchema,
    required: [true, 'Local Guardian Name is Required'],
  },
  profileImg: { type: String },
  isActive: {
    type: String,
    enum: ['active', 'block'],
    default: 'active',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

//pre save middleware / hook : will work on create() save()
studentValidationSchema.pre('save', async function (next) {
  //hashing password and save into DB

  //eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );

  next();
});

//post save middleware / hook
studentValidationSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

//query middleware
studentValidationSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

studentValidationSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

studentValidationSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  // console.log(this.pipeline());
  next();
});

//creating a custom static method

// studentValidationSchema.statics.isUserExists = async function(id: string){
//   const existingUser = await Student.findOne({id});

//   return existingUser;
// }

//model

export const StudentModel = model<TStudent>('Student', studentValidationSchema);

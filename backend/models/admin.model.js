import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true,
    minlength: 3
  },
  lastName: { 
    type: String, 
    required: true,
    minlength: 3
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  }
}, { 
  timestamps: true 
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
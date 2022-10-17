import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userid: String,
  lastMessageDate: Number,
});

export default mongoose.model('user', schema)
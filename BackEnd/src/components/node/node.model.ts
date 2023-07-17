import { Schema, model } from "mongoose";

export interface INode {
  id: Schema.Types.ObjectId,
  prev: Schema.Types.ObjectId | null,
  next: Schema.Types.ObjectId | null
}

const NodeSchema = new Schema<INode>({
  prev: {
    type: Schema.Types.ObjectId,
    default: null
  },
  next: {
    type: Schema.Types.ObjectId,
    default: null
  }
});

NodeSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    delete ret._id;
  }
});

export default model<INode>("Node", NodeSchema);

export type KeyType = string | number | symbol;

export type Matrix<Value = number> = Value[][];

export type Matrix4<Value = number> = [
  [Value, Value, Value, Value],
  [Value, Value, Value, Value],
  [Value, Value, Value, Value],
  [Value, Value, Value, Value]
];

export type Matrix3<Value = number> = [
  [Value, Value, Value],
  [Value, Value, Value],
  [Value, Value, Value]
];

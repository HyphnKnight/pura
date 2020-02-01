export type KeyType = string | number | symbol;

export type Diff<T extends KeyType, U extends KeyType> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];

export type Omit<T, K extends keyof T> = { [P in Diff<keyof T, K>]: T[P] };

export type Matrix<Value = number> = Value[][];

export type Matrix4<Value = number> = [
  [Value, Value, Value, Value],
  [Value, Value, Value, Value],
  [Value, Value, Value, Value],
  [Value, Value, Value, Value],
];

export type Matrix3<Value = number> = [
  [Value, Value, Value],
  [Value, Value, Value],
  [Value, Value, Value],
];

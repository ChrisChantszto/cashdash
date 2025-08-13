export type User = {
  _id: string;
  name: string;
  email: string;
};

export type LoginScreenProps = {
  onLogin: (user: User) => void;
};

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

export const nanoid = (size = 8): string => {
  let id = '';
  for (let i = 0; i < size; i += 1) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
};

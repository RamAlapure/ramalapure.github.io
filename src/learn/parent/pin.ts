export const PIN_LENGTH = 4;

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function verifyParentPin(storedPin: string | undefined, enteredPin: string): boolean {
  if (!storedPin || !isValidPin(enteredPin)) return false;
  return storedPin === enteredPin;
}

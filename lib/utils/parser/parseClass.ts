export function parseBoolean(value: string | number): Boolean {
  switch (value) {
    case "true":
    case 1:
    case "1":
    case "on":
    case "yes":
      return true;
    default:
      return false;
  }
}

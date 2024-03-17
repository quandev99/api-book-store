export function calculateDiscountedPrice(price, discount_percentage) {
  if (discount_percentage === null || discount_percentage === undefined) {
    return null;
  }
  return price * (1 - discount_percentage / 100);
}

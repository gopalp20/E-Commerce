const AppError = require("../utils/AppError");
const addressFields = [
  "name",
  "phone",
  "line1",
  "line2",
  "city",
  "state",
  "postalCode",
  "country",
];
const snapshotAddress = (address) =>
  Object.fromEntries(addressFields.map((key) => [key, address[key] || ""]));

async function saveAddress(tx, userId, input) {
  const count = await tx.address.count({ where: { userId } });
  if (count >= 20)
    throw new AppError(
      "You can save up to 20 addresses. Remove an unused address first.",
      400,
    );
  const isDefault = count === 0 || input.isDefault === true;
  if (isDefault)
    await tx.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  return tx.address.create({
    data: {
      ...snapshotAddress(input),
      label: input.label || "Home",
      userId,
      isDefault,
    },
  });
}
module.exports = { saveAddress, snapshotAddress };

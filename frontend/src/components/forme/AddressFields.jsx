import { Field } from "./UI";
export const emptyAddress = {
  label: "Home",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};
export const deliveryFields = (address) =>
  Object.fromEntries(
    [
      "name",
      "phone",
      "line1",
      "line2",
      "city",
      "state",
      "postalCode",
      "country",
    ].map((key) => [key, address[key] || ""]),
  );
export function AddressFields({
  value,
  onChange,
  includeLabel = false,
  prefix = "delivery",
}) {
  const change = (event) =>
    onChange({ ...value, [event.target.name]: event.target.value });
  return (
    <div className="form-grid">
      {includeLabel && (
        <Field
          className="wide"
          label="Address label"
          id={`${prefix}-label`}
          name="label"
          value={value.label}
          onChange={change}
          placeholder="Home, Work, or a name you recognise"
          required
          maxLength={40}
        />
      )}
      <Field
        label="Full name"
        id={`${prefix}-name`}
        name="name"
        autoComplete="shipping name"
        value={value.name}
        onChange={change}
        required
        minLength={2}
        maxLength={100}
      />
      <Field
        label="Mobile number"
        id={`${prefix}-phone`}
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="shipping tel-national"
        value={value.phone}
        onChange={change}
        placeholder="10-digit mobile number"
        required
        pattern="[6-9][0-9]{9}"
        maxLength={10}
      />
      <Field
        className="wide"
        label="Address"
        id={`${prefix}-line1`}
        name="line1"
        autoComplete="shipping address-line1"
        value={value.line1}
        onChange={change}
        placeholder="House number, street and area"
        required
        minLength={5}
        maxLength={200}
      />
      <Field
        className="wide"
        label="Apartment, landmark, etc. (optional)"
        id={`${prefix}-line2`}
        name="line2"
        autoComplete="shipping address-line2"
        value={value.line2}
        onChange={change}
        maxLength={200}
      />
      <Field
        label="City"
        id={`${prefix}-city`}
        name="city"
        autoComplete="shipping address-level2"
        value={value.city}
        onChange={change}
        required
        minLength={2}
        maxLength={100}
      />
      <Field
        label="State"
        id={`${prefix}-state`}
        name="state"
        autoComplete="shipping address-level1"
        value={value.state}
        onChange={change}
        required
        minLength={2}
        maxLength={100}
      />
      <Field
        label="PIN code"
        id={`${prefix}-postalCode`}
        name="postalCode"
        inputMode="numeric"
        autoComplete="shipping postal-code"
        value={value.postalCode}
        onChange={change}
        required
        pattern="[1-9][0-9]{5}"
        maxLength={6}
      />
      <Field
        label="Country"
        id={`${prefix}-country`}
        name="country"
        value="India"
        readOnly
      />
    </div>
  );
}
export function AddressText({ address }) {
  return (
    <address className="saved-address-text">
      <strong>{address.name}</strong>
      <span>
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}
      </span>
      <span>
        {address.city}, {address.state} {address.postalCode}
      </span>
      <span>
        {address.country} · {address.phone}
      </span>
    </address>
  );
}

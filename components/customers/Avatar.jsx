function initials(name) {
  return String(name || "Customer")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ customer }) {
  if (customer.profilePhoto) {
    return (
      <img
        src={customer.profilePhoto}
        alt={customer.fullName}
        className="size-10 rounded-md object-cover"
      />
    );
  }
  return (
    <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
      {initials(customer.fullName)}
    </span>
  );
}

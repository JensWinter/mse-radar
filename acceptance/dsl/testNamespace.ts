export function namespaceEmail(email: string, token: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return email;
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  return `${local}+${token}@${domain}`;
}

export function namespaceName(name: string, token: string): string {
  return `${name} ${token}`;
}

export const normalizeAuthUser = (user = {}, authPayload = {}) => {
  const payloadRoles = Array.isArray(authPayload.roles) ? authPayload.roles : [];
  const userRoles = Array.isArray(user.roles) ? user.roles : [];

  const roleSet = new Set([...payloadRoles, ...userRoles].filter(Boolean));
  const fallbackPrimaryRole = authPayload.user_type || user.user_type;
  if (fallbackPrimaryRole) {
    roleSet.add(fallbackPrimaryRole);
  }

  const roles = Array.from(roleSet);
  const userType = authPayload.user_type || user.user_type || roles[0] || null;

  return {
    ...user,
    user_type: userType,
    roles,
  };
};

export const hasRole = (user = {}, role) => {
  if (!role) return false;
  const normalized = normalizeAuthUser(user);
  return normalized.roles.includes(role);
};

export const hasAnyRole = (user = {}, roles = []) => {
  if (!Array.isArray(roles) || roles.length === 0) return false;
  const normalized = normalizeAuthUser(user);
  return roles.some((role) => normalized.roles.includes(role));
};

export const isKioskUser = (user = {}) => hasRole(user, "kiosk_user");

export const isLguAdmin = (user = {}) => hasRole(user, "lgu_admin");

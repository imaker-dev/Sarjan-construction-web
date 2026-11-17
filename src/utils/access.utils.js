
export const hasAccess = ({
  user,
  roles,
  permissions,
  permissionMode = "any",
}) => {
  if (!roles?.length && !permissions?.length) return true;
  if (!user) return false;

  const userRoles = user.roles?.length
    ? user.roles
    : user.role
      ? [user.role]
      : [];

  const userPermissions = user.permissions || [];

  const roleAllowed =
    !roles?.length ||
    roles.some((role) => userRoles.includes(role));

  const permissionAllowed =
    !permissions?.length ||
    (permissionMode === "all"
      ? permissions.every((permission) =>
          userPermissions.includes(permission),
        )
      : permissions.some((permission) =>
          userPermissions.includes(permission),
        ));

  return roleAllowed && permissionAllowed;
};

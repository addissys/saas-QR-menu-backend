import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'habesha@gmail.com', deleted_at: null },
    include: { role: true },
  });
  if (!user) {
    console.log('USER NOT FOUND');
    return;
  }
  console.log('=== USER ===');
  console.log(JSON.stringify({ id: user.id, email: user.email, full_name: user.full_name, role: user.role.name, role_id: user.role_id }, null, 2));

  const rolePerms = await prisma.rolePermission.findMany({
    where: { role_id: user.role_id, deleted_at: null, permission: { deleted_at: null } },
    include: { permission: true },
  });
  console.log('\n=== STAFF ROLE PERMISSIONS ===');
  rolePerms.forEach((rp) => console.log('  ' + rp.permission.permission));

  const userPerms = await prisma.userPermission.findMany({
    where: { user_id: user.id },
    include: { permission: true },
    orderBy: { permission_id: 'asc' },
  });
  console.log('\n=== USER PERMISSIONS (all including soft-deleted) ===');
  userPerms.forEach((up) => console.log('  ' + up.permission.permission + ' deleted_at=' + up.deleted_at));

  const activeUserPerms = userPerms.filter((up) => !up.deleted_at);
  console.log('\n=== ACTIVE USER PERMISSIONS ===');
  if (activeUserPerms.length === 0) console.log('  NONE');
  else activeUserPerms.forEach((up) => console.log('  ' + up.permission.permission));

  const roleCodes = new Set(rolePerms.map((rp) => rp.permission.permission));
  const userCodes = new Set(activeUserPerms.map((up) => up.permission.permission));
  const effective = new Set([...roleCodes, ...userCodes]);
  console.log('\n=== EFFECTIVE PERMISSIONS ===');
  [...effective].sort().forEach((p) => {
    const fromRole = roleCodes.has(p);
    const fromUser = userCodes.has(p);
    const source = fromRole && fromUser ? 'ROLE+USER' : fromRole ? 'ROLE' : 'USER';
    console.log('  ' + p + ' -> ' + source);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

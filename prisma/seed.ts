import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // =====================================================
  // Roles
  // =====================================================

  const roles = [
    { name: 'SUPER_ADMIN', description: 'Platform administrator' },
    { name: 'CAFE_OWNER', description: 'Restaurant owner' },
    { name: 'EXECUTIVE', description: 'Manages assigned branches' },
    { name: 'BRANCH_MANAGER', description: 'Manages a restaurant branch' },
    { name: 'STAFF', description: 'Restaurant staff member' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  console.log('✅ Roles seeded successfully');

  // =====================================================
  // Permissions
  // =====================================================

  const permissions = [
    // ── Menu Items ──────────────────────────────────────────────────────────
    { permission: 'menu_items.read',              module: 'menu_items', action: 'read',                description: 'View menu items' },
    { permission: 'menu_items.create',            module: 'menu_items', action: 'create',              description: 'Create new menu items (dishes)' },
    { permission: 'menu_items.update',            module: 'menu_items', action: 'update',              description: 'Edit and update menu items' },
    { permission: 'menu_items.delete',            module: 'menu_items', action: 'delete',              description: 'Delete menu items' },
    { permission: 'menu_items.toggle_availability', module: 'menu_items', action: 'toggle_availability', description: 'Toggle in-stock / sold-out status of menu items' },
    { permission: 'menu_items.toggle_featured',   module: 'menu_items', action: 'toggle_featured',     description: 'Toggle featured status of menu items' },

    // ── Categories ──────────────────────────────────────────────────────────
    { permission: 'categories.read',   module: 'categories', action: 'read',   description: 'View menu categories' },
    { permission: 'categories.create', module: 'categories', action: 'create', description: 'Create new menu categories' },
    { permission: 'categories.update', module: 'categories', action: 'update', description: 'Edit menu categories' },
    { permission: 'categories.delete', module: 'categories', action: 'delete', description: 'Delete menu categories' },

    // ── Tables ──────────────────────────────────────────────────────────────
    { permission: 'tables.read',   module: 'tables', action: 'read',   description: 'View restaurant tables' },
    { permission: 'tables.create', module: 'tables', action: 'create', description: 'Create restaurant tables' },
    { permission: 'tables.update', module: 'tables', action: 'update', description: 'Edit restaurant tables' },
    { permission: 'tables.delete', module: 'tables', action: 'delete', description: 'Delete restaurant tables' },

    // ── QR Codes ────────────────────────────────────────────────────────────
    { permission: 'qr_codes.read',   module: 'qr_codes', action: 'read',   description: 'View QR codes' },
    { permission: 'qr_codes.create', module: 'qr_codes', action: 'create', description: 'Generate QR codes' },
    { permission: 'qr_codes.delete', module: 'qr_codes', action: 'delete', description: 'Delete QR codes' },

    // ── Users ────────────────────────────────────────────────────────────────
    { permission: 'users.read',               module: 'users', action: 'read',               description: 'View users' },
    { permission: 'users.create',             module: 'users', action: 'create',             description: 'Create new users' },
    { permission: 'users.update',             module: 'users', action: 'update',             description: 'Edit users' },
    { permission: 'users.delete',             module: 'users', action: 'delete',             description: 'Delete users' },
    { permission: 'users.manage_permissions', module: 'users', action: 'manage_permissions', description: 'Grant or revoke additional permissions for individual users' },

    // ── Branches ─────────────────────────────────────────────────────────────
    { permission: 'branches.read',   module: 'branches', action: 'read',   description: 'View branches' },
    { permission: 'branches.create', module: 'branches', action: 'create', description: 'Create branches' },
    { permission: 'branches.update', module: 'branches', action: 'update', description: 'Edit branches' },
    { permission: 'branches.delete', module: 'branches', action: 'delete', description: 'Delete branches' },

    // ── Notifications ─────────────────────────────────────────────────────────
    { permission: 'notifications.read', module: 'notifications', action: 'read', description: 'View notifications' },

    // ── Audit Logs ────────────────────────────────────────────────────────────
    { permission: 'audit_logs.read', module: 'audit_logs', action: 'read', description: 'View audit logs' },
  ];

  for (const perm of permissions) {
    const existing = await prisma.permission.findFirst({
      where: { permission: perm.permission },
    });

    if (existing) {
      await prisma.permission.update({
        where: { id: existing.id },
        data: { module: perm.module, action: perm.action, description: perm.description },
      });
    } else {
      await prisma.permission.create({ data: perm });
    }
  }

  console.log('✅ Permissions seeded successfully');

  // =====================================================
  // Role Permissions Mapping (Initial Defaults)
  // =====================================================

  const defaultRolePermissions: Record<string, string[]> = {
    STAFF: [
      'menu_items.read',
      'menu_items.toggle_availability',
      'categories.read',
      'tables.read',
      'notifications.read',
    ],
    BRANCH_MANAGER: [
      'menu_items.read',
      'menu_items.create',
      'menu_items.update',
      'menu_items.toggle_availability',
      'menu_items.toggle_featured',
      'categories.read',
      'categories.create',
      'categories.update',
      'tables.read',
      'tables.create',
      'tables.update',
      'qr_codes.read',
      'qr_codes.create',
      'users.read',
      'users.create',
      'users.update',
      'branches.read',
      'branches.update',
      'notifications.read',
    ],
    EXECUTIVE: [
      'menu_items.read',
      'menu_items.create',
      'menu_items.update',
      'menu_items.delete',
      'menu_items.toggle_availability',
      'menu_items.toggle_featured',
      'categories.read',
      'categories.create',
      'categories.update',
      'categories.delete',
      'tables.read',
      'tables.create',
      'tables.update',
      'tables.delete',
      'qr_codes.read',
      'qr_codes.create',
      'qr_codes.delete',
      'users.read',
      'users.create',
      'users.update',
      'branches.read',
      'branches.update',
      'notifications.read',
      'audit_logs.read',
    ],
  };

  for (const [roleName, permCodes] of Object.entries(defaultRolePermissions)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    // Only seed if role has NO existing active role permissions (preserve manual updates)
    const existingCount = await prisma.rolePermission.count({
      where: { role_id: role.id, deleted_at: null },
    });

    if (existingCount === 0) {
      const perms = await prisma.permission.findMany({
        where: { permission: { in: permCodes }, deleted_at: null },
      });

      for (const perm of perms) {
        await prisma.rolePermission.upsert({
          where: {
            role_id_permission_id: {
              role_id: role.id,
              permission_id: perm.id,
            },
          },
          create: { role_id: role.id, permission_id: perm.id },
          update: { deleted_at: null },
        });
      }
      console.log(`✅ Seeded ${perms.length} default permissions for ${roleName}`);
    }
  }
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


"use strict";

const normalizeTableName = (table) => {
  if (typeof table === "string") return table;
  if (table && typeof table.tableName === "string") return table.tableName;
  return "";
};

const hasTable = (tables, name) => tables.includes(name);

module.exports = {
  async up(queryInterface, Sequelize) {
    const tablesRaw = await queryInterface.showAllTables();
    const tables = tablesRaw.map(normalizeTableName);

    const hasUsersUpper = hasTable(tables, "Users");
    const hasUsersLower = hasTable(tables, "users");
    const hasProspectsUpper = hasTable(tables, "Prospects");
    const hasProspectsLower = hasTable(tables, "prospects");

    if (hasUsersUpper && !hasUsersLower) {
      await queryInterface.renameTable("Users", "users");
    }

    if (hasProspectsUpper && !hasProspectsLower) {
      await queryInterface.renameTable("Prospects", "prospects");
    }

    const usersTable = hasUsersLower || hasUsersUpper ? "users" : null;

    if (usersTable) {
      const userColumns = await queryInterface.describeTable(usersTable);

      if (!userColumns.apellido_paterno) {
        await queryInterface.addColumn(usersTable, "apellido_paterno", {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }

      if (!userColumns.apellido_materno) {
        await queryInterface.addColumn(usersTable, "apellido_materno", {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }

      if (!userColumns.tel) {
        await queryInterface.addColumn(usersTable, "tel", {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }

      const userIndexes = await queryInterface.showIndex(usersTable);
      const hasEmailUnique = userIndexes.some((index) => {
        const hasEmailField =
          Array.isArray(index.fields) &&
          index.fields.some((field) => field.attribute === "email");
        return hasEmailField && Boolean(index.unique);
      });

      if (!hasEmailUnique) {
        await queryInterface.addIndex(usersTable, ["email"], {
          unique: true,
          name: "users_email_unique",
        });
      }
    }
  },

  async down() {
    // Migracion de alineacion en produccion: no-op para evitar perdida de datos.
  },
};

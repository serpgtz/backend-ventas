'use strict';

const getTableColumns = async (queryInterface, tableName) => {
  try {
    return await queryInterface.describeTable(tableName);
  } catch (_error) {
    return null;
  }
};

const hasIndex = async (queryInterface, tableName, indexName) => {
  try {
    const indexes = await queryInterface.showIndex(tableName);
    return indexes.some((index) => index.name === indexName);
  } catch (_error) {
    return false;
  }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    const columns = await getTableColumns(queryInterface, 'prospects');

    if (!columns) {
      return;
    }

    if (!columns.userId) {
      await queryInterface.addColumn('prospects', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    const hasUserCreatedIdx = await hasIndex(
      queryInterface,
      'prospects',
      'prospects_user_created_idx'
    );
    if (!hasUserCreatedIdx) {
      await queryInterface.addIndex('prospects', ['userId', 'createdAt'], {
        name: 'prospects_user_created_idx',
      });
    }

    const hasUserNivelIdx = await hasIndex(queryInterface, 'prospects', 'prospects_user_nivel_idx');
    if (!hasUserNivelIdx) {
      await queryInterface.addIndex('prospects', ['userId', 'nivel_venta'], {
        name: 'prospects_user_nivel_idx',
      });
    }

    if (dialect === 'mysql' || dialect === 'mariadb') {
      const [userNullsResult] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) AS total FROM prospects WHERE userId IS NULL'
      );

      const userNulls = Number(userNullsResult?.[0]?.total || 0);

      if (userNulls === 0) {
        await queryInterface.changeColumn('prospects', 'userId', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        });
      }

      const [dependenciaNullsResult] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) AS total FROM prospects WHERE dependencia IS NULL'
      );

      const dependenciaNulls = Number(dependenciaNullsResult?.[0]?.total || 0);

      if (dependenciaNulls === 0) {
        await queryInterface.changeColumn('prospects', 'dependencia', {
          type: Sequelize.ENUM('IMSS', 'ISSSTE', 'CFE', 'PEMEX'),
          allowNull: false,
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const columns = await getTableColumns(queryInterface, 'prospects');

    if (!columns) {
      return;
    }

    const hasUserCreatedIdx = await hasIndex(
      queryInterface,
      'prospects',
      'prospects_user_created_idx'
    );
    if (hasUserCreatedIdx) {
      await queryInterface.removeIndex('prospects', 'prospects_user_created_idx');
    }

    const hasUserNivelIdx = await hasIndex(queryInterface, 'prospects', 'prospects_user_nivel_idx');
    if (hasUserNivelIdx) {
      await queryInterface.removeIndex('prospects', 'prospects_user_nivel_idx');
    }

    if (columns.userId) {
      await queryInterface.changeColumn('prospects', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    if (columns.dependencia) {
      await queryInterface.changeColumn('prospects', 'dependencia', {
        type: Sequelize.ENUM('IMSS', 'ISSSTE', 'CFE', 'PEMEX'),
        allowNull: true,
      });
    }
  },
};

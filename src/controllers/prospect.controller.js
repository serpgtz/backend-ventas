const prospectService = require('../services/prospect.service');

const mapProspectOutput = (prospect) => {
  const plain = typeof prospect?.toJSON === 'function' ? prospect.toJSON() : prospect;
  const { nivel_venta, ...rest } = plain;

  return {
    ...rest,
    estado: nivel_venta || null,
  };
};

const buildConcentradoByEstado = (prospects) => {
  return prospects.reduce(
    (acc, prospect) => {
      if (prospect.estado === 'caliente') acc.caliente += 1;
      else if (prospect.estado === 'tibio') acc.tibio += 1;
      else if (prospect.estado === 'frio') acc.frio += 1;
      else acc.sin_estado += 1;

      return acc;
    },
    { caliente: 0, tibio: 0, frio: 0, sin_estado: 0 }
  );
};

const createProspect = async (req, res, next) => {
  try {
    const prospect = await prospectService.createProspect(req.body, req.files, req.user.userId);
    res.status(201).json({
      success: true,
      message: 'Prospecto creado correctamente',
      data: mapProspectOutput(prospect),
    });
  } catch (error) {
    next(error);
  }
};

const getAllProspects = async (req, res, next) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const { rows, count, concentrado, page: currentPage, limit: currentLimit } =
      await prospectService.getAllProspects({
        userId: req.user.userId,
        page: parsedPage,
        limit: parsedLimit,
      });

    const prospects = rows.map(mapProspectOutput);
    const fallbackConcentrado = buildConcentradoByEstado(prospects);

    res.status(200).json({
      success: true,
      total: count,
      concentrado: concentrado || fallbackConcentrado,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total: count,
      },
      data: prospects,
    });
  } catch (error) {
    next(error);
  }
};

const searchProspectsByName = async (req, res, next) => {
  try {
    const { q, limit = 10, page = 1 } = req.query;

    const { rows, count, page: currentPage, limit: currentLimit } =
      await prospectService.searchProspectsByName({
        q,
        page,
        limit,
        userId: req.user.userId,
      });

    const data = rows.map((prospect) => ({
      id: prospect.id,
      nombre: prospect.nombre,
      apellido_paterno: prospect.apellido_paterno || '',
      apellido_materno: prospect.apellido_materno || '',
    }));

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProspectById = async (req, res, next) => {
  try {
    const prospect = await prospectService.getProspectById(req.params.id, req.user.userId);
    res.status(200).json({ success: true, data: mapProspectOutput(prospect) });
  } catch (error) {
    next(error);
  }
};

const updateProspect = async (req, res, next) => {
  try {
    const prospect = await prospectService.updateProspect(
      req.params.id,
      req.body,
      req.files,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: 'Prospecto actualizado correctamente',
      data: mapProspectOutput(prospect),
    });
  } catch (error) {
    next(error);
  }
};

const deleteProspect = async (req, res, next) => {
  try {
    await prospectService.deleteProspect(req.params.id, req.user.userId);
    res.status(200).json({ success: true, message: 'Prospecto eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

const getProspectFile = async (req, res, next) => {
  try {
    const { path } = req.query;

    const link = await prospectService.getTemporaryFileLink({
      path,
      userId: req.user.userId,
    });

    res.redirect(link);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProspect,
  getAllProspects,
  searchProspectsByName,
  getProspectById,
  updateProspect,
  deleteProspect,
  getProspectFile,
};

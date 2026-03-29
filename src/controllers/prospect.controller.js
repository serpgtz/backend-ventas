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
    console.log(req.body);
    console.log(req.files);

    const prospect = await prospectService.createProspect(req.body, req.files);
    res.status(201).json({
      message: 'Prospecto creado correctamente',
      data: mapProspectOutput(prospect),
    });
  } catch (error) {
    next(error);
  }
};

const getAllProspects = async (_req, res, next) => {
  try {
    const prospects = (await prospectService.getAllProspects()).map(mapProspectOutput);
    const concentrado = buildConcentradoByEstado(prospects);

    res.status(200).json({
      success: true,
      total: prospects.length,
      concentrado,
      data: prospects,
      prospects,
    });
  } catch (error) {
    next(error);
  }
};

const searchProspectsByName = async (req, res, next) => {
  try {
    const { q, limit = '10', page = '1' } = req.query;

    if (!q || q.trim() === '') {
      const error = new Error('El parámetro "q" es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    if (q.trim().length > 100) {
      const error = new Error('El parámetro "q" no debe exceder 100 caracteres');
      error.statusCode = 400;
      throw error;
    }

    const parsedLimit = Number.parseInt(limit, 10);
    const parsedPage = Number.parseInt(page, 10);

    if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
      const error = new Error('El parámetro "limit" debe ser un entero mayor a 0');
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(parsedPage) || parsedPage <= 0) {
      const error = new Error('El parámetro "page" debe ser un entero mayor a 0');
      error.statusCode = 400;
      throw error;
    }

    const { rows, count, page: currentPage, limit: currentLimit } =
      await prospectService.searchProspectsByName({
        q,
        page: parsedPage,
        limit: parsedLimit,
      });

    const data = rows.map((prospect) => {
      const fullLastName = (prospect.apellidos || '').trim();
      const [apellido_paterno, ...rest] = fullLastName.split(/\s+/).filter(Boolean);

      return {
        id: prospect.id,
        nombre: prospect.nombre,
        apellido_paterno: apellido_paterno || '',
        apellido_materno: rest.join(' '),
      };
    });

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
    const prospect = await prospectService.getProspectById(req.params.id);
    res.status(200).json({ data: mapProspectOutput(prospect) });
  } catch (error) {
    next(error);
  }
};

const updateProspect = async (req, res, next) => {
  try {
    const prospect = await prospectService.updateProspect(req.params.id, req.body, req.files);
    res.status(200).json({
      message: 'Prospecto actualizado correctamente',
      data: mapProspectOutput(prospect),
    });
  } catch (error) {
    next(error);
  }
};

const deleteProspect = async (req, res, next) => {
  try {
    await prospectService.deleteProspect(req.params.id);
    res.status(200).json({ message: 'Prospecto eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

const getProspectFile = async (req, res, next) => {
  try {
    const { path } = req.query;
    const link = await prospectService.getTemporaryFileLink(path);
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

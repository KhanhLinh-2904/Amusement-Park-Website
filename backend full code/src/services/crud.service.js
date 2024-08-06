const httpStatus = require("http-status");

const getAll = async Model => Model.find({});
const create = async (Model, body) => {
  const data = await Model.create(body);
  return data;
};

const getById = async (Model, id) => {
  const data = await Model.findById(id);
  return data;
};
const getbyParam = async (Modal, param) => {
  const data = await Modal.findOne(param);
  return data;
};
const updateById = async (Model, id, body) => {
  const data = await getById(Model, id);
  const updateContent = body;
  if (!data) {
    throw new Error(httpStatus.NOT_FOUND, "Not found");
  }
  Object.assign(data, updateContent);
  await data.save();
  return data;
};
const updateByParams = async (Model, param, body) => {
  const data = await getbyParam(Model, param);
  const updateContent = body;
  if (!data) {
    throw new Error(httpStatus.NOT_FOUND, "Not found");
  }
  Object.assign(data, updateContent);
  await data.save();
  return data;
};
const deleteById = async (Model, id) => {
  const data = await getById(Model, id);
  if (!data) {
    throw new Error(httpStatus.NOT_FOUND, "Not found");
  }
  await data.remove();
  return data;
};

module.exports = {
  getAll,
  getById,
  getbyParam,
  create,
  updateById,
  deleteById,
  updateByParams,
};

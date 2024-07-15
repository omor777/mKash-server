const error = (msg = "Server Error Occurred", status = 500) => {
  const e = new Error();
  e.message = msg;
  e.status = status;
  return e;
};

export default error;

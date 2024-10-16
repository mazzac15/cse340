const errorController = {};

errorController.footerError = async (req, res, next) => {
    const err = new Error("Intentional 500 Error: This is a test.")
    err.status = 500
    next(err)
};

module.exports = errorController;
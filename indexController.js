

exports.index_get = (req, res, next) => {
    res.render('index', { title: 'home', currentPage: "index" });
}

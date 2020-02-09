

exports.index_get = (req, res, next) => {
    res.render('stats', { title: 'stats', currentPage: "stats", user: req.user });
}

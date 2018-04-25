

exports.index_get = (req, res, next) => {
    // let username = null;
    // if (req.user.username !== undefined) {
    //     username = req.user.username;
    // }
    res.render('index', {title: 'home', currentPage: "index", user: req.user});
}

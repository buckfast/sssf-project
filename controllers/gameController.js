

exports.game_get = (req, res, next) => {
    res.render("play", {title: 'play', currentPage: "play", user: req.user});
}


exports.game_post = (req, res, next) => {
    res.send("create game");
}

exports.game_id_get = (req, res, next) => {
    res.render("room", {title: 'room '+req.params.id, currentPage: "play", user: req.user});
}

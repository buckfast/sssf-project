
fetch("/api/users", {method: 'GET'})
.then(res => res.json())
.catch(err => console.log(err))
.then(res => {
  //console.log(res);
  for (let key in res) {
    $(".user-container").append('<a href="/users/'+res[key].username+'"<figure class="user-figure"> <img src="/images/'+res[key].avatar+'" alt="" /><figcaption class="user-figcap"><h6>'+res[key].username+'</h6></figcaption> </figure></a>');
  }
});

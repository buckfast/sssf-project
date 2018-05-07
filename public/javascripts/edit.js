let count = 0;
document.getElementById("delete").addEventListener('click',  (evt) => {

  if (count == 1) {
    const url = "/api/users/"+evt.target.getAttribute("data-id");
    fetch(url, {
      method: 'DELETE',
      credentials: 'include',
    }).then(res => res.json())
    .catch(error => console.error('Error:', error))
    .then(response => {
      console.log('Success:', response)
      window.location.href = "/";
    });

  }

  if (count == 0) {
    count++;

    const confirm = document.getElementsByClassName("confirmdelete")[0];
    confirm.innerHTML = "Press delete again to confirm deletion";
  }

});
